"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { usePostPage } from "@/features/post/hook/usePostPage";
import Header from "./_component/Header";
import ControlsBar from "./_component/ControlsBar";
import ErrorState from "./_component/ErrorState";
import EmptyState from "./_component/EmptyState";
import ListContent from "./_component/ListContent";
import PageSectionShell from "./_component/PageSectionShell";
import PageSelector from "@/shared/components/pagination/PageSelector";

type ViewMode = "grid" | "compact";

export default function PostPage() {
  const params = useParams<{ link?: string[] }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const first = Array.isArray(params?.link) ? params!.link[0] : undefined;
  const decoded = first ? decodeURIComponent(first) : null;
  const title = decoded ?? "POSTS";

  // ===== React Query hook =====
  const {
    data,
    isPending,
    isFetching,
    error,
    page,
    setPage,
    sortKey,
    setSortKey,
    sortDir,
    setSortDir,
    prefetch,
  } = usePostPage();

  // ===== View mode persist =====
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const storageKey = `posts:viewMode`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey) as ViewMode | null;
      if (saved === "grid" || saved === "compact") setViewMode(saved);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, viewMode);
    } catch {}
  }, [viewMode]);

  // ===== URL <-> page sync =====
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const p = Number(searchParams.get("p") ?? "1");
    if (!Number.isNaN(p) && p > 0 && p !== page) {
      setPage(p);
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [searchParams, page, setPage]);

  // k(키워드) 변경 시 페이지 1로
  useEffect(() => {
    // 의도적으로 get("k")만 추적
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("k")]);

  // 정렬 변경 시 페이지 1로
  const prevSort = useRef<{ key: string; dir: string } | null>(null);
  useEffect(() => {
    const curr = { key: String(sortKey), dir: String(sortDir) };
    const prev = prevSort.current;
    if (prev && (prev.key !== curr.key || prev.dir !== curr.dir)) {
      // querystring의 p=1로 동기화
      const sp = new URLSearchParams(searchParams.toString());
      sp.set("p", "1");
      router.push(`?${sp.toString()}`, { scroll: false });
      setPage(1);
    }
    prevSort.current = curr;
  }, [sortKey, sortDir, setPage, router, searchParams]);

  // ===== Derived =====
  const posts = data?.content ?? [];
  const hasData = !!data && posts.length > 0;

  const showSkeleton = isPending && !data;
  const showEmpty = !!data && !isPending && !isFetching && posts.length === 0;
  const isRefreshing = isFetching && !!data;

  // ===== Search wiring =====
  const keyword = (searchParams.get("k") ?? "").trim();

  const handleSearch = (k: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (k) sp.set("k", k);
    else sp.delete("k");
    sp.set("p", "1"); // 검색 시 항상 첫 페이지
    router.push(`?${sp.toString()}`, { scroll: false });
    setPage(1);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <PageSectionShell sectionRef={sectionRef}>
      <Header decoded={decoded} title={title} />

      {error && (
        <ErrorState message="네트워크 상태가 불안정하거나 서버에서 일시적인 오류가 발생했습니다. 잠시 후 다시 시도하시거나 정렬 조건을 변경해주시기 바랍니다." />
      )}

      <ControlsBar
        sortKey={sortKey}
        sortDir={sortDir}
        onChangeSortKey={setSortKey}
        onChangeSortDir={setSortDir}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        disabled={isRefreshing}
        keyword={keyword}
        onSearch={handleSearch}
      />

      {showSkeleton && <ListContent viewMode={viewMode} posts={[]} showSkeleton />}

      {showEmpty && <EmptyState />}

      {hasData && (
        <>
          <ListContent
            viewMode={viewMode}
            posts={posts}
            showSkeleton={false}
            isRefreshing={isRefreshing}
            overlay
          />

          <div className="mt-10">
            <PageSelector
              pagination={data!.pagination}
              action={(p) => {
                prefetch?.(p);
                const sp = new URLSearchParams(searchParams.toString());
                sp.set("p", String(p));
                router.push(`?${sp.toString()}`, { scroll: false });
                setPage(p);
                sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              shouldBePushed
              prefetch={prefetch}
            />
          </div>
        </>
      )}
    </PageSectionShell>
  );
}
