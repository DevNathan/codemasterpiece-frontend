"use client";

import { Badge } from "@/shared/components/shadcn/badge";
import { EyeOff, Trash } from "lucide-react";
import React from "react";

type Props = {
  nickname: string;
  timeText: string;
  deleted: boolean;
  hidden: boolean;
};

export default function CommentHeader({
  nickname,
  timeText,
  deleted,
  hidden,
}: Props) {
  return (
    <div className="flex justify-between items-center">
      <h5 className="font-semibold text-sm sm:text-base">{nickname}</h5>
      <div className="flex flex-wrap items-center gap-1.5">
        {deleted && (
          <Badge variant="destructive" className="gap-1 px-2 py-0.5">
            <Trash className="h-3.5 w-3.5" />
            삭제됨
          </Badge>
        )}
        {hidden && (
          <Badge variant="secondary" className="gap-1 px-2 py-0.5">
            <EyeOff className="h-3.5 w-3.5" />
            숨김
          </Badge>
        )}
        <time className="text-xs sm:text-sm text-muted-foreground">
          {timeText}
        </time>
      </div>
    </div>
  );
}
