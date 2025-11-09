"use client";

import React from "react";
import { AspectRatio } from "@/shared/components/shadcn/aspect-ratio";
import { Card, CardContent } from "@/shared/components/shadcn/card";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { cn } from "@/lib/utils";

/** GridCard와 동일한 프레임/높이를 가진 스켈레톤 */
type Props = { className?: string };

export const GridCardSkeleton: React.FC<Props> = ({ className }) => {
  return (
    <AspectRatio ratio={4 / 5} className={cn("w-full", className)}>
      <div className="relative h-full w-full">
        <div className="[perspective:900px] relative h-full">
          {/* 3D 래퍼(스택 고립) */}
          <div
            className="relative h-full rounded-2xl isolate drop-shadow-sm"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* ambient glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-0.5 rounded-2xl z-[1]"
              style={{
                transform: "translateZ(20px)",
                maskImage:
                  "radial-gradient(120px 80px at 20% -10%, black, transparent 60%)",
                background:
                  "radial-gradient(240px 140px at 20% -10%, color-mix(in oklab, var(--color-primary) 28%, transparent), transparent 70%)",
                opacity: 0.14,
              }}
            />
            {/* gradient ring */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl z-[1]"
              style={{
                transform: "translateZ(18px)",
                padding: "1px",
                background:
                  "linear-gradient(180deg, color-mix(in oklab, var(--color-primary) 35%, transparent), transparent)",
                WebkitMask:
                  "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />

            {/* 카드 본체 */}
            <Card
              className="relative z-0 h-full overflow-hidden rounded-2xl border bg-card shadow-sm flex flex-col"
              style={{ transform: "translateZ(10px)" }}
            >
              {/* 헤더 (이미지 16:9 + 좌상단 배지 자리) */}
              <div className="relative">
                <AspectRatio ratio={16 / 9} className="bg-muted">
                  <Skeleton className="h-full w-full" />
                </AspectRatio>

                {/* 좌측 배지 2칸 자리 */}
                <div className="absolute left-2 top-2 flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>

                {/* 하단 그라데이션 + 타이틀/시간 자리 */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0">
                  <div className="h-20 bg-gradient-to-t from-background/85 to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3">
                    <div className="flex items-end justify-between gap-3">
                      {/* 타이틀(2줄 높이 고정) */}
                      <div className="flex min-h-[44px] w-full flex-col gap-2">
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <Skeleton className="mb-0.5 h-3 w-16 shrink-0" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 본문 */}
              <CardContent className="flex flex-1 flex-col gap-3 p-4">
                {/* 요약(2줄 고정 높이) */}
                <div className="min-h-[44px]">
                  <Skeleton className="mb-2 h-4 w-[92%]" />
                  <Skeleton className="h-4 w-[70%]" />
                </div>

                {/* 태그 영역 (고정 높이 24px) */}
                <div className="mt-0.5 h-6 flex items-center gap-1.5">
                  <Skeleton className="h-[20px] w-12 rounded-full" />
                  <Skeleton className="h-[20px] w-10 rounded-full" />
                  <Skeleton className="h-[20px] w-14 rounded-full" />
                </div>

                <div className="my-1 h-px w-full bg-border/70" />

                {/* 푸터 */}
                <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-5 w-12 rounded-md" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AspectRatio>
  );
};

export const GridCardSkeletonGrid: React.FC<{ count?: number }> = ({
  count = 8,
}) => {
  return (
    <section className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <GridCardSkeleton key={i} />
      ))}
    </section>
  );
};
