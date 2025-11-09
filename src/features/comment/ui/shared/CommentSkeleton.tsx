"use client";

import React from "react";
import { Skeleton } from "@/shared/components/shadcn/skeleton"; // shadcn/ui 기준
import { cn } from "@/lib/utils";

type Props = { depth?: number };

const CommentSkeleton = ({ depth = 0 }: Props) => {
  const indentDepth = Math.min(depth, 2);
  return (
    <li className="w-full">
      <div
        className={cn(
          "flex gap-3 sm:gap-4 items-start bg-sidebar rounded-xl px-4 py-3 sm:px-5 sm:py-4 shadow-sm w-full",
          {
            "ml-4": indentDepth > 0,
            "pl-2 sm:pl-4": indentDepth === 1,
            "pl-4 sm:pl-6": indentDepth === 2,
          },
        )}
      >
        {/* 좌측 아바타 */}
        <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shrink-0" />

        {/* 우측 본문 */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28 sm:w-32" />
            <Skeleton className="h-3 w-20 sm:w-24" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      {/* 대댓글 스켈레톤 예시 1~2개 */}
      {depth === 0 && (
        <ul className="mt-4 ml-4 border-l border-border space-y-3 pl-4 sm:pl-6">
          <li>
            <div className="flex gap-3 sm:gap-4 items-start">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </li>
        </ul>
      )}
    </li>
  );
};

export default CommentSkeleton;
