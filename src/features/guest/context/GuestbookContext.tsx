"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { InfiniteData, useInfiniteQuery, UseInfiniteQueryResult, useQueryClient } from "@tanstack/react-query";

import { getEntrySlice } from "@/features/guest/api/getEntrySlice";
import { EntryDTO, EntryDTOSchema } from "@/features/guest/types/EntryDTO";
import { SliceOfSchema } from "@/shared/type/SliceSchema";

/** 단일 슬라이스 응답 타입 */
type GuestbookSlice = SliceOfSchema<typeof EntryDTOSchema>;
/** 무한 스크롤 데이터 타입 */
type GuestbookInfiniteData = InfiniteData<GuestbookSlice, string | undefined>;

/**
 * 방명록 컨텍스트 타입
 */
type GuestbookContextType = {
  /** 페이지 크기 */
  size: number;
  /** 페이지 크기 변경 및 캐시 재설정 */
  setSize: (s: number) => void;

  /** useInfiniteQuery 결과 객체 */
  query: UseInfiniteQueryResult<GuestbookInfiniteData, Error>;
  /** 평탄화된 엔트리 목록 */
  items: EntryDTO[];

  /** 다음 페이지 로드 */
  loadMore: () => Promise<void>;
  /** 전체 리프레시(첫 페이지부터 재조회) */
  refresh: () => Promise<void>;
  /** 신규 엔트리 낙관적 prepend */
  applyNewEntry: (entry: EntryDTO) => void;
  updateEntry: (entry: EntryDTO) => void;
  deleteEntryFromCache: (id: string) => void;
  /** 관련 캐시 무효화 */
  invalidate: () => Promise<void>;
};

const GuestbookContext = createContext<GuestbookContextType | undefined>(
  undefined,
);

type GuestbookProviderProps = {
  /** 초기 페이지 크기 (기본 20) */
  initialSliceSize?: number;
  /** 초기 활성화 여부 */
  enabled?: boolean;
  /** 자식 노드 */
  children: ReactNode;
};

/**
 * 방명록 데이터 공급자
 * - 커서 기반 무한 스크롤(fetchNextPage)
 * - 신규 엔트리 낙관적 반영(applyNewEntry)
 * - 사이즈 변경 시 키 변경 및 캐시 리셋
 */
export const GuestbookProvider = ({
  initialSliceSize = 20,
  enabled = true,
  children,
}: GuestbookProviderProps) => {
  const qc = useQueryClient();
  const [size, setSizeState] = useState<number>(initialSliceSize);

  const queryKey = ["guestbook", "slice", size] as const;

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
            e.entryId === updated.entryId ? updated : e
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
    [qc, queryKey]
  );

  const invalidate = useCallback(
    async () => qc.invalidateQueries({ queryKey: ["guestbook"] }),
    [qc],
  );

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
    [size, setSize, query, items, loadMore, refresh, applyNewEntry, invalidate],
  );

  return (
    <GuestbookContext.Provider value={value}>
      {children}
    </GuestbookContext.Provider>
  );
};

/**
 * 방명록 컨텍스트 훅
 * @throws Error Provider 외부에서 호출 시
 */
export const useGuestbook = () => {
  const ctx = useContext(GuestbookContext);
  if (!ctx)
    throw new Error("useGuestbook must be used within GuestbookProvider");
  return ctx;
};
