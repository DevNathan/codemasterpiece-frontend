"use client";

import { useState } from "react";
import { Button } from "@/shared/components/shadcn/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/components/shadcn/tooltip";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommentReaction } from "@/features/comment/api/reactToComment";
import { useCommentContext } from "@/features/comment/context/CommentContext";

type Props = {
  commentId: string;
  score: number;
  myReaction: CommentReaction;
  className?: string;
};

export default function ReactionBar({
  commentId,
  score,
  myReaction,
  className,
}: Props) {
  const { react } = useCommentContext();
  const [pending, setPending] = useState(false);

  const onUp = async () => {
    if (pending) return;
    setPending(true);
    try {
      const next = myReaction === "UPVOTE" ? null : "UPVOTE";
      await react(commentId, next);
    } finally {
      setPending(false);
    }
  };

  const onDown = async () => {
    if (pending) return;
    setPending(true);
    try {
      const next = myReaction === "DOWNVOTE" ? null : "DOWNVOTE";
      await react(commentId, next);
    } finally {
      setPending(false);
    }
  };

  const upActive = myReaction === "UPVOTE";
  const downActive = myReaction === "DOWNVOTE";

  const upLabel = upActive ? "좋아요 취소" : "좋아요";
  const downLabel = downActive ? "싫어요 취소" : "싫어요";

  return (
    <div className={cn("flex-none w-10 select-none", className)}>
      <div className="sticky top-1/2 self-start h-fit">
        <div className="flex flex-col items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-10 h-10 rounded-full hover:bg-accent",
                  upActive && "text-red-500",
                )}
                aria-label={upLabel}
                type="button"
                disabled={pending}
                onClick={onUp}
              >
                <ArrowBigUp
                  className={cn(
                    "!w-6 !h-6",
                    upActive && "fill-red-500 stroke-red-500",
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              {upLabel}
            </TooltipContent>
          </Tooltip>

          <div className="text-sm font-semibold tabular-nums">{score}</div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-10 h-10 rounded-full hover:bg-accent",
                  downActive && "text-red-500",
                )}
                aria-label={downLabel}
                type="button"
                disabled={pending}
                onClick={onDown}
              >
                <ArrowBigDown
                  className={cn(
                    "!w-6 !h-6",
                    downActive && "fill-red-500 stroke-red-500",
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center">
              {downLabel}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
