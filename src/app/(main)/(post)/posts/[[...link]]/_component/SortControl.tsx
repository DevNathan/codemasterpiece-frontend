"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/shadcn/dropdown-menu";
import { Button } from "@/shared/components/shadcn/button";
import { ArrowDownUp } from "lucide-react";

export type SortKey =
  | "createdAt"
  | "updatedAt"
  | "title"
  | "viewCount"
  | "likeCount";
export type SortDir = "ASC" | "DESC";

type SortButtonProps = {
  sortKey: SortKey;
  sortDir: SortDir;
  onChangeSortKey: (k: SortKey) => void;
  onChangeSortDir: (d: SortDir) => void;
  className?: string;
};

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: "createdAt", label: "최신순" },
  { value: "updatedAt", label: "업데이트순" },
  { value: "title", label: "제목순" },
  { value: "viewCount", label: "조회순" },
  { value: "likeCount", label: "좋아요순" },
];

export default function SortControl({
  sortKey,
  sortDir,
  onChangeSortKey,
  onChangeSortDir,
  className,
}: SortButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("gap-1 [&_svg]:!size-5", className)}
          aria-label="정렬 메뉴 열기"
        >
          <ArrowDownUp />
          <span className="text-sm">
            {labelOf(sortKey)} · {sortDir}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-56">
        {/* 정렬 기준 */}
        <DropdownMenuRadioGroup
          value={sortKey}
          onValueChange={(v) => onChangeSortKey(v as SortKey)}
        >
          {OPTIONS.map((opt) => (
            <DropdownMenuRadioItem key={opt.value} value={opt.value}>
              {opt.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        {/* 정렬 방향 */}
        <DropdownMenuRadioGroup
          value={sortDir.toLowerCase()}
          onValueChange={(v) => onChangeSortDir(v.toUpperCase() as SortDir)}
        >
          <DropdownMenuRadioItem value="asc">오름차순</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="desc">내림차순</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function labelOf(k: SortKey) {
  switch (k) {
    case "createdAt":
      return "최신";
    case "updatedAt":
      return "업데이트";
    case "title":
      return "제목";
    case "viewCount":
      return "조회";
    case "likeCount":
      return "좋아요";
  }
}
