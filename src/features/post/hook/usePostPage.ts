"use client";

import { useCallback, useMemo, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import getPostPage from "@/features/post/api/getPostPage";
import { PostPageResponse } from "@/features/post/type/PostPageResponse";
import { useAuth } from "@/contexts/UserContext";

/** 정렬 키 */
type SortKey = "createdAt" | "updatedAt" | "title" | "viewCount" | "likeCount";
/** 정렬 방향 */
type SortDir = "ASC" | "DESC";

/** 캐시 키 */
const postPageKey = (p: {
  page: number;
  size: number;
  sortKey: SortKey;
  sortDir: SortDir;
  link: string | null;
  elevated: boolean;
  keyword: string | null;
}) => ["posts", "page", p] as const;

/**
 * 게시글 페이지 조회 훅
 */
export function usePostPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();

  /** 현재 라우트에서 게시판 링크(slug) 추출 */
  const rawLink = (params as Record<string, unknown>)?.["link"];
  const link = Array.isArray(rawLink)
    ? (rawLink[0] ?? null)
    : ((rawLink as string | undefined) ?? null);

  /** URL ?k= 키워드 (트리밍, 빈 문자열이면 null) */
  const rawK = (searchParams.get("k") ?? "").trim();
  const keyword = rawK.length > 0 ? rawK : null;

  /** AUTHOR 권한 여부 */
  const elevated = user?.role === "AUTHOR";

  // ====== 로컬 상태 ======
  const [page, setPage] = useState(1); // 1-based
  const [size, setSize] = useState(12);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("DESC");

  // ====== 쿼리 파라미터 ======
  const queryParams = useMemo(
    () => ({ page, size, sortKey, sortDir, link, elevated, keyword }),
    [page, size, sortKey, sortDir, link, elevated, keyword],
  );
  const queryKey = postPageKey(queryParams);

  // ====== 조회 ======
  const query = useQuery<PostPageResponse>({
    queryKey,
    queryFn: async () => (await getPostPage(queryParams)).data!,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // ====== 프리페치 ======
  const prefetch = useCallback(
    async (targetPage: number) => {
      const nextParams = { ...queryParams, page: targetPage };
      await qc.prefetchQuery({
        queryKey: postPageKey(nextParams),
        queryFn: async () => (await getPostPage(nextParams)).data!,
        staleTime: 5 * 60 * 1000,
      });
    },
    [qc, queryParams],
  );

  // ====== 무효화 ======
  const invalidate = useCallback(
    async () => qc.invalidateQueries({ queryKey: ["posts"] }),
    [qc],
  );

  return {
    ...query,
    page,
    setPage,
    size,
    setSize,
    sortKey,
    setSortKey,
    sortDir,
    setSortDir,
    prefetch,
    invalidate,
    link,
    elevated,
    keyword,
  };
}
