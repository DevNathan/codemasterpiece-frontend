"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel } from "@/shared/components/shadcn/dropdown-menu";
import { Separator } from "@/shared/components/shadcn/separator";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import CommentForm from "@/features/comment/ui/form/CommentForm";
import { cn } from "@/lib/utils";
import React from "react";

type Props = {
  nickname: string;
  parentId: string;
  trigger: React.ReactNode;
};

export default function ReplyDropdown({ nickname, parentId, trigger }: Props) {
  return (
    <DropdownMenu>
      {trigger}
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={cn(
          "p-0 overflow-hidden",
          "w-[min(92vw,520px)] rounded-2xl border",
          "bg-popover/95 backdrop-blur supports-[backdrop-filter]:bg-popover/60",
          "shadow-[0_20px_60px_rgba(0,0,0,0.25)]",
        )}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="h-1 w-full bg-gradient-to-r from-point/50 via-point to-point/50" />

        <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
          <DropdownMenuLabel className="p-0 text-base sm:text-lg font-semibold tracking-tight">
            대댓글 작성
          </DropdownMenuLabel>
          <span className="text-xs sm:text-sm text-muted-foreground">@{nickname}</span>
        </div>

        <Separator />

        <div className="max-h-[60vh] overflow-y-auto p-3 sm:p-4">
          <CommentForm parentId={parentId} />
        </div>

        <Separator />

        <div className="px-4 sm:px-5 py-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Enter=제출, Shift+Enter=줄바꿈</span>
          <span>Esc=닫기</span>
        </div>

        <DropdownMenuArrow className="fill-border" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
