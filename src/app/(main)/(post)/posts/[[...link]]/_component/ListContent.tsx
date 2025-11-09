"use client";

import GridMode from "./GridMode";
import ListMode from "./ListMode";
import { GridCardSkeletonGrid } from "@/shared/components/posts/grid/GridCardSkeleton";
import { ListCardSkeletonList } from "@/shared/components/posts/list/ListCardSkeleton";

type Props = {
  viewMode: "grid" | "compact";
  posts: any[];
  showSkeleton: boolean;
  isRefreshing?: boolean;
  overlay?: boolean;
};

export default function ListContent({
  viewMode,
  posts,
  showSkeleton,
  isRefreshing,
  overlay,
}: Props) {
  if (showSkeleton) {
    return viewMode === "grid" ? (
      <GridCardSkeletonGrid />
    ) : (
      <ListCardSkeletonList />
    );
  }

  const body =
    viewMode === "grid" ? (
      <GridMode posts={posts} />
    ) : (
      <ListMode posts={posts} />
    );

  if (!overlay || !isRefreshing) return body;

  return (
    <div className="relative">
      {body}

      {/* Overlay */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        {/* 부드러운 라디얼 빛 확산 */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80 backdrop-blur-sm transition-opacity" />

        {/* 상단 프로그레스 라인 (살짝 움직이는 느낌) */}
        <div className="absolute left-0 top-0 h-[2px] w-full overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1/3 animate-[slide_1.5s_ease-in-out_infinite] bg-primary/60" />
        </div>

        {/* 중앙 로딩 영역 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
          {/* 스피너 */}
          <div className="relative">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <div className="absolute inset-0 m-auto h-4 w-4 rounded-full bg-primary/20 blur-sm" />
          </div>

          {/* 텍스트 */}
          <p className="text-xs font-medium tracking-wide text-muted-foreground animate-pulse">
            새로운 게시글을 불러오는 중입니다...
          </p>
        </div>
      </div>
    </div>
  )
}
