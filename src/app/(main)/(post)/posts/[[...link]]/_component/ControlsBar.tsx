"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Separator } from "@/shared/components/shadcn/separator";
import { Input } from "@/shared/components/shadcn/input";
import { Button } from "@/shared/components/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/shadcn/tooltip";
import { Search, X } from "lucide-react";
import SortControl from "./SortControl";
import ViewModeControl from "./ViewModeControl";

type SortKey = "createdAt" | "updatedAt" | "title" | "viewCount" | "likeCount";
type SortDir = "ASC" | "DESC";
type ViewMode = "grid" | "compact";

type Props = {
  sortKey: SortKey;
  sortDir: SortDir;
  onChangeSortKey: (v: SortKey) => void;
  onChangeSortDir: (v: SortDir) => void;
  viewMode: ViewMode;
  onChangeViewMode: (v: ViewMode) => void;
  disabled?: boolean;
  keyword?: string;
  onSearch?: (k: string) => void;
  onKeywordChange?: (k: string) => void;
};

export default function ControlsBar({
  sortKey,
  sortDir,
  onChangeSortKey,
  onChangeSortDir,
  viewMode,
  onChangeViewMode,
  disabled = false,
  keyword = "",
  onSearch,
  onKeywordChange,
}: Props) {
  const [value, setValue] = useState<string>(keyword ?? "");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setValue(keyword ?? ""), [keyword]);

  const canSubmit = useMemo<boolean>(() => !disabled, [disabled]);
  const canClear = useMemo<boolean>(
    () => !disabled && value.length > 0,
    [disabled, value.length],
  );

  const submit = useCallback((): void => {
    if (!canSubmit) return;
    onSearch?.(value.trim());
  }, [canSubmit, onSearch, value]);

  const clear = useCallback((): void => {
    if (!canClear) return;
    setValue("");
    onKeywordChange?.("");
    onSearch?.("");
    inputRef.current?.focus();
  }, [canClear, onKeywordChange, onSearch]);

  // '/' focus, 'Esc' clear/blur
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (disabled) return;
      const active = document.activeElement as HTMLElement | null;
      const typing =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active?.isContentEditable === true;

      if (!typing && e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (typing && e.key === "Escape") {
        if (value) clear();
        else active?.blur();
      }
    };
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [clear, disabled, value]);

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      submit();
    },
    [submit],
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const next = e.target.value;
      setValue(next);
      onKeywordChange?.(next);
    },
    [onKeywordChange],
  );

  return (
    <div className="w-full">
      <div
        className={`px-3 sm:px-5 transition-opacity ${disabled ? "opacity-60" : ""}`}
        aria-busy={disabled}
      >
        {/* 상단: 검색 박스 (모바일 전체폭) */}
        <form
          onSubmit={onSubmit}
          role="search"
          aria-label="게시글 검색"
          className="flex min-w-0 items-center gap-2 rounded-2xl border bg-background/60 px-2 py-1 sm:px-2.5 sm:py-1.5"
        >
          <Search className="h-5 w-5 shrink-0 opacity-60" aria-hidden />
          <Input
            ref={inputRef}
            value={value}
            onChange={onChange}
            placeholder="검색어… (제목 / 요약 / 본문 / 태그)"
            aria-label="검색어 입력"
            inputMode="search"
            spellCheck={false}
            autoCorrect="off"
            className="
              h-11 sm:h-10 border-0 bg-transparent
              focus-visible:ring-0 focus-visible:ring-offset-0
              text-base sm:text-sm
            "
          />
          <div className="ml-auto flex items-center gap-1">
            {canClear && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-11 w-11 sm:h-9 sm:w-9"
                onClick={clear}
                aria-label="검색어 지우기"
              >
                <X className="h-5 w-5 sm:h-4 sm:w-4" />
              </Button>
            )}
            <Button
              type="submit"
              variant="default"
              size="icon"
              className="h-11 w-11 sm:h-9 sm:w-9"
              disabled={!canSubmit}
              aria-label="검색"
            >
              <Search className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </form>

        {/* 모바일 힌트: 아래 줄에 작게, 데스크톱만 노출 */}
        <div className="mt-1 hidden items-center gap-2 text-xs text-muted-foreground md:flex">
          <kbd className="rounded border px-1.5 py-0.5">/</kbd>
          <span>focus</span>
          <span className="opacity-40">·</span>
          <kbd className="rounded border px-1.5 py-0.5">Esc</kbd>
          <span>clear</span>
        </div>

        {/* 하단: 정렬/뷰모드 (모바일 가로 스크롤 안전) */}
        <div
          className="
            mt-3 flex w-full min-w-0 items-center justify-between gap-2
            md:mt-3
          "
        >
          {/* 왼쪽은 비움(필요 시 정보 배지 등) */}

          {/* 오른쪽 컨트롤들은 모바일에서 overflow-x 허용 */}
          <div
            className="
              -mx-1 flex min-w-0 flex-1 justify-end gap-2 overflow-x-auto px-1
              [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            "
          >
            {/* 내부 버튼들은 shrink-0로 줄바꿈 없이 스크롤 */}
            <div className="flex items-center gap-2 shrink-0">
              <SortControl
                sortKey={sortKey}
                sortDir={sortDir}
                onChangeSortKey={onChangeSortKey}
                onChangeSortDir={onChangeSortDir}
              />
              <ViewModeControl
                viewMode={viewMode}
                onChangeViewMode={onChangeViewMode}
              />
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-4 sm:my-5" />
    </div>
  );
}
