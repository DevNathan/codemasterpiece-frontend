"use client";

import React, { forwardRef, useMemo } from "react";
import { Heart, Sparkles } from "lucide-react";
import ShareDialog from "@/shared/components/share/ShareDialog";
import { Button } from "@/shared/components/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/shadcn/tooltip";
import { cn } from "@/lib/utils";

type Props = {
  likeCount: number;
  isLiked: boolean;
  handleLikeClick: () => void;
  isPending: boolean;
  className?: string;
};

/** 섹션 루트에 ref가 직접 걸리도록 설계 */
const LikeAndShare = forwardRef<HTMLElement, Props>(function LikeAndShare(
  { likeCount, isLiked, handleLikeClick, isPending, className },
  ref,
) {
  const likeLabel = useMemo(
    () => (isLiked ? "좋아요 취소" : "좋아요"),
    [isLiked],
  );

  return (
    <section
      ref={ref}
      className={cn(
        "mt-10 flex flex-col items-center gap-4 text-foreground",
        className,
      )}
      aria-label="글 액션"
    >
      <h3 className="text-base font-semibold">
        게시글이 도움이 되셨다면 좋아요를 눌러주세요
      </h3>

      <div className="flex items-center gap-8">
        {/* LIKE */}
        <div className="flex flex-col items-center gap-1">
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleLikeClick}
                aria-pressed={isLiked}
                aria-label={likeLabel}
                disabled={isPending}
                className={cn(
                  "relative h-11 w-11 rounded-full transition cursor-pointer",
                  "hover:scale-[1.03] active:scale-95",
                  isLiked && "ring-2 ring-primary/50",
                )}
              >
                <Heart
                  className={cn(
                    "h-5 w-5 transition-all",
                    isLiked && "fill-red-500 stroke-red-500",
                  )}
                />
                {isLiked && (
                  <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-primary animate-pulse" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{likeLabel}</TooltipContent>
          </Tooltip>

          <div
            className={cn(
              "min-w-8 rounded-full px-2 py-0.5 text-center text-xs",
              "bg-muted text-foreground/80",
            )}
            aria-live="polite"
          >
            {likeCount}
          </div>
        </div>

        {/* SHARE */}
        <div className="flex flex-col items-center gap-1">
          <ShareDialog
            buttonVariant="secondary"
            buttonSize="icon"
            buttonAriaLabel="공유"
            buttonClassName="h-11 w-11 rounded-full hover:scale-[1.03] active:scale-95"
            tooltip={{ side: "top", delay: 100, label: "공유" }}
          />
          <div className="min-w-8 px-2 py-0.5 text-center text-xs text-muted-foreground">
            공유
          </div>
        </div>
      </div>
    </section>
  );
});

export default LikeAndShare;
