// features/comment/ui/item/parts/HideToggleButton.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/shared/components/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/shadcn/tooltip";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/UserContext";
import { useCommentContext } from "@/features/comment/context/CommentContext";

type Props = {
  /** 댓글 ID (필수) */
  commentId: string;
  /** 현재 숨김 상태 (디자인 그대로 유지) */
  hidden: boolean;
  /**
   * AUTHOR 권한만 토글 가능하게 막을지 여부
   * 기본 true. 필요하면 false로 내려서 누구나 토글 트리거 가능하게 변경.
   */
  requireAuthor?: boolean;
  /** 외부에서 강제 disabled 시킬 때만 사용 (선택) */
  disabled?: boolean;
  className?: string;
};

export default function HideToggleButton({
  commentId,
  hidden,
  requireAuthor = true,
  disabled,
  className,
}: Props) {
  const { user } = useAuth();
  const { hide } = useCommentContext();

  const isAuthorRole = user?.role === "AUTHOR";
  const canToggle = requireAuthor ? isAuthorRole : true;

  const [pending, setPending] = useState(false);

  const label = hidden ? "숨김 해제" : "숨김 처리";

  const onToggle = async () => {
    if (!canToggle || pending) return;
    setPending(true);
    try {
      await hide(commentId, !hidden);
    } finally {
      setPending(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-full hover:bg-muted ${className ?? ""}`}
          aria-label={label}
          onClick={onToggle}
          disabled={pending || disabled || !canToggle}
        >
          {hidden ? (
            <Eye width={18} height={18} />
          ) : (
            <EyeOff width={18} height={18} />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" align="center">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
