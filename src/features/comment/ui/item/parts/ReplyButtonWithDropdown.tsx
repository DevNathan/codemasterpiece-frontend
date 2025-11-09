// features/comment/ui/item/parts/ReplyButtonWithDropdown.tsx
"use client";

import React from "react";
import { Button } from "@/shared/components/shadcn/button";
import { ReplyIcon } from "lucide-react";
import { DropdownMenuTrigger } from "@/shared/components/shadcn/dropdown-menu";
import ReplyDropdown from "@/features/comment/ui/item/parts/ReplyDropdown";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/shadcn/tooltip";

type Props = {
  nickname: string;
  parentId: string;
};

export default function ReplyButtonWithDropdown({ nickname, parentId }: Props) {
  return (
    <ReplyDropdown
      nickname={nickname}
      parentId={parentId}
      trigger={
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-full hover:bg-accent"
                aria-label="대댓글 작성"
              >
                <ReplyIcon width={18} height={18} />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" align="center">
            대댓글 작성
          </TooltipContent>
        </Tooltip>
      }
    />
  );
}
