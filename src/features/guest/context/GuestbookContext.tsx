"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQueryClient,
} from "@tanstack/react-query";

import { getEntrySlice } from "@/features/guest/api/getEntrySlice";
import { EntryDTO, EntryDTOSchema } from "@/features/guest/types/EntryDTO";
import { SliceOfSchema } from "@/shared/type/SliceSchema";

/** 단일 슬라이스 응답 타입입니다. */
type GuestbookSlice = SliceOfSchema<typeof EntryDTOSchema>;
/** 무한 스크롤 데이터 타입입니다. */
type GuestbookInfiniteData = InfiniteData<GuestbookSlice, string | undefined>;

/**
 * 방명록 컨텍스트가 제공하는 상태 및 제어 함수 인터페이스입니다.
 */
type GuestbookContextType = {
  /** 현재 요청된 페이지 크기입니다. */
  size: number;
  /** 페이지 크기를 변경하고 관련된 캐시를 초기화합니다. */
  setSize: (s: number) => void;

  /** 무한 스크롤 조회를 위한 Query 객체입니다. */
  query: UseInfiniteQueryResult<GuestbookInfiniteData, Error>;
  /** 현재 로드된 모든 페이지의 방명록 데이터를 1차원 배열로 병합한 목록입니다. */
  items: EntryDTO[];

  /** 다음 페이지의 방명록 데이터를 요청합니다. */
  loadMore: () => Promise<void>;
  /** 현재까지 로드된 캐시를 모두 제거하고 첫 페이지부터 다시 조회합니다. */
  refresh: () => Promise<void>;
  /** 새로운 방명록 작성 시 로컬 캐시 최상단에 데이터를 낙관적으로 추가합니다. */
  applyNewEntry: (entry: EntryDTO) => void;
  /** 특정 방명록 데이터 수정 시 로컬 캐시를 갱신합니다. */
  updateEntry: (entry: EntryDTO) => void;
  /** 특정 방명록 데이터 삭제 시 로컬 캐시에서 해당 항목을 제거합니다. */
  deleteEntryFromCache: (id: string) => void;
  /** 방명록과 관련된 모든 쿼리 캐시를 무효화하여 서버와의 동기화를 유도합니다. */
  invalidate: () => Promise<void>;
};

const GuestbookContext = createContext<GuestbookContextType | undefined>(
  undefined,
);

type GuestbookProviderProps = {
  /** 초기 요청 페이지 크기입니다. (기본값: 20) */
  initialSliceSize?: number;
  /** 초기 쿼리 활성화 여부입니다. (기본값: true) */
  enabled?: boolean;
  children: ReactNode;
};

/**
 * @component GuestbookProvider
 * @description
 */
export const GuestbookProvider = ({
  initialSliceSize = 20,
  enabled = true,
  children,
}: GuestbookProviderProps) => {
  const qc = useQueryClient();
  const [size, setSizeState] = useState<number>(initialSliceSize);

  const queryKey = useMemo(() => ["guestbook", "slice", size] as const, [size]);

  const fetchPage = useCallback(
    async (cursor?: string) => (await getEntrySlice(cursor, size)).data!,
    [size],
  );

  const query = useInfiniteQuery<
    GuestbookSlice,
    Error,
    GuestbookInfiniteData,
    typeof queryKey,
    string | undefined
  >({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const items = useMemo<EntryDTO[]>(
    () => (query.data?.pages ?? []).flatMap((p) => p.content),
    [query.data],
  );

  const refresh = useCallback(async () => {
    qc.removeQueries({ queryKey });
    await query.refetch();
  }, [qc, query, queryKey]);

  const setSize = useCallback(
    (s: number) => {
      const next = Math.max(1, Math.min(100, s));
      setSizeState(next);
      qc.removeQueries({ queryKey: ["guestbook", "slice"] });
    },
    [qc],
  );

  const loadMore = useCallback(async () => {
    if (query.hasNextPage) {
      await query.fetchNextPage();
    }
  }, [query]);

  const applyNewEntry = useCallback(
    (entry: EntryDTO) => {
      qc.setQueryData<GuestbookInfiniteData>(queryKey, (old) => {
        if (!old) {
          return {
            pageParams: [undefined],
            pages: [
              {
                content: [entry],
                size,
                first: true,
                last: false,
                hasNext: false,
                nextCursor: null,
              },
            ],
          };
        }
        const [first, ...rest] = old.pages;
        const updatedFirst: GuestbookSlice = {
          ...first,
          content: [entry, ...first.content],
        };
        return { ...old, pages: [updatedFirst, ...rest] };
      });
    },
    [qc, queryKey, size],
  );

  const updateEntry = useCallback(
    (updated: EntryDTO) => {
      qc.setQueryData<GuestbookInfiniteData>(queryKey, (old) => {
        if (!old) return old;

        const newPages = old.pages.map((page) => {
          const newContent = page.content.map((e) =>
            e.entryId === updated.entryId ? updated : e,
          );
          return { ...page, content: newContent };
        });

        return {
          ...old,
          pages: newPages,
        };
      });
    },
    [qc, queryKey],
  );

  const deleteEntryFromCache = useCallback(
    (id: string) => {
      qc.setQueryData<GuestbookInfiniteData>(queryKey, (old) => {
        if (!old) return old;

        const updatedPages = old.pages.map((page) => ({
          ...page,
          content: page.content.filter((e) => e.entryId !== id),
        }));

        return { ...old, pages: updatedPages };
      });
    },
    [qc, queryKey],
  );

  const invalidate = useCallback(
    async () => qc.invalidateQueries({ queryKey: ["guestbook"] }),
    [qc],
  );

  /**
   * 반환되는 컨텍스트 객체의 의존성 무결성을 보장합니다.
   * 누락된 상태 업데이트 함수들을 포함하여 React Compiler의 최적화 조건을 충족합니다.
   */
  const value = useMemo<GuestbookContextType>(
    () => ({
      size,
      setSize,
      query,
      items,
      loadMore,
      refresh,
      applyNewEntry,
      updateEntry,
      deleteEntryFromCache,
      invalidate,
    }),
    [
      size,
      setSize,
      query,
      items,
      loadMore,
      refresh,
      applyNewEntry,
      updateEntry,
      deleteEntryFromCache,
      invalidate,
    ],
  );

  return (
    <GuestbookContext.Provider value={value}>
      {children}
    </GuestbookContext.Provider>
  );
};

/**
 * @function useGuestbook
 * @description 방명록 컨텍스트를 사용하기 위한 커스텀 훅입니다.
 * @throws {Error} GuestbookProvider 외부에서 호출될 경우 예외를 발생시킵니다.
 */
export const useGuestbook = () => {
  const ctx = useContext(GuestbookContext);
  if (!ctx)
    throw new Error("useGuestbook must be used within GuestbookProvider");
  return ctx;
};
