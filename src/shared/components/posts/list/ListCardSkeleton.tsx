"use client";

import React from "react";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { cn } from "@/lib/utils";

/** ListCard와 동일한 프레임/높이를 가진 스켈레톤 */
type Props = { className?: string };

export const ListCardSkeleton: React.FC<Props> = ({ className }) => {
  return (
    <div
      className={cn(
        "group grid gap-3 rounded-lg p-3 transition-colors sm:grid-cols-[12rem_1fr] sm:gap-5 sm:p-4",
        className,
      )}
    >
      {/* 썸네일: 모바일 16:9, sm부터 고정 h-28 w-48 */}
      <div
        className="
          relative overflow-hidden rounded-md bg-muted
          aspect-[16/9] w-full
          sm:aspect-auto sm:h-28 sm:w-48
        "
      >
        <Skeleton className="absolute inset-0 h-full w-full" />
      </div>

      {/* 텍스트 영역 */}
      <div className="flex min-w-0 flex-col justify-between">
        <div className="flex flex-col gap-1">
          {/* 상단 메타(모바일에서만 노출) */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:hidden">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>

          {/* 제목 2줄 영역 */}
          <div className="flex min-h-[44px] flex-col gap-2">
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>

          {/* 요약 2줄 영역 */}
          <div className="mt-1 flex min-h-[40px] flex-col gap-2">
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[72%]" />
          </div>

          {/* 태그: 모바일 2개 + +N, sm 이상에서 다수 */}
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {/* 공통 2개 */}
            <Skeleton className="h-[20px] w-12 rounded-full" />
            <Skeleton className="h-[20px] w-10 rounded-full" />
            {/* +N (모바일 전용) */}
            <Skeleton className="h-[20px] w-10 rounded-full sm:hidden" />
            {/* sm 이상에서 많은 태그가 보이는 영역 대체 */}
            <div className="hidden items-center gap-1.5 sm:flex">
              <Skeleton className="h-[20px] w-12 rounded-full" />
              <Skeleton className="h-[20px] w-14 rounded-full" />
              <Skeleton className="h-[20px] w-10 rounded-full" />
            </div>
          </div>
        </div>

        {/* 하단 메타: 모바일은 위에서 일부 출력, sm부터 좌우 정렬 */}
        <div
          className="
            mt-2 flex flex-col gap-2 text-xs text-muted-foreground
            sm:flex-row sm:items-center sm:justify-between
          "
        >
          {/* sm 이상에서 보이는 카테고리/날짜 */}
          <div className="hidden items-center gap-2 sm:flex">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>

          {/* 조회/좋아요 */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ListCardSkeletonList: React.FC<{
  count?: number;
}> = ({ count = 8 }) => {
  return (
    <section className={"mt-6 flex flex-col divide-y divide-border/60"}>
      {Array.from({ length: count }).map((_, i) => (
        <ListCardSkeleton
          key={i}
          className="bg-transparent hover:bg-muted/30"
        />
      ))}
    </section>
  );
};
