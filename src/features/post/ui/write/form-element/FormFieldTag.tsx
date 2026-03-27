"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/shadcn/form";
import { Input } from "@/shared/components/shadcn/input";
import { Button } from "@/shared/components/shadcn/button";
import { Badge } from "@/shared/components/shadcn/badge";
import { Tag as TagIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_TAGS = 20;
const MIN_LEN = 1;
const MAX_LEN = 20;

/**
 * @component FormFieldTag
 * @description 게시글의 태그를 입력하고 관리하는 폼 필드입니다.
 * useMemo를 사용하여 태그 목록의 참조 무결성을 보장함으로써 불필요한 리렌더링과 의존성 재생성을 방지합니다.
 */
const FormFieldTag = () => {
  const { control, setValue } = useFormContext();

  /** * useWatch로부터 태그 목록을 실시간으로 구독합니다.
   * useMemo를 사용하여 빈 배열의 참조를 고정함으로써 useCallback 의존성 배열의 무결성을 유지합니다.
   */
  const watchedTags = useWatch({ control, name: "tags" }) as
    | string[]
    | undefined;
  const tags = useMemo(() => watchedTags ?? [], [watchedTags]);

  const [tagInput, setTagInput] = useState("");
  const [hint, setHint] = useState<string | null>(null);

  const canAddMore = tags.length < MAX_TAGS;

  /** 입력된 태그 문자열을 정규화합니다(공백을 대시로 치환). */
  const normalize = useCallback(
    (s: string) => s.trim().replace(/\s+/g, "-"),
    [],
  );

  /** 태그 목록에 새로운 태그를 추가합니다. */
  const addTag = useCallback(
    (raw: string) => {
      const v = normalize(raw).toLowerCase();
      if (!v) return;
      if (!canAddMore) {
        setHint(`태그는 최대 ${MAX_TAGS}개까지.`);
        return;
      }
      if (v.length < MIN_LEN) {
        setHint("태그가 너무 짧습니다.");
        return;
      }
      if (v.length > MAX_LEN) {
        setHint(`태그는 최대 ${MAX_LEN}자.`);
        return;
      }
      if (tags.includes(v)) {
        setHint("이미 추가된 태그입니다.");
        return;
      }
      setValue("tags", [...tags, v], {
        shouldDirty: true,
        shouldValidate: true,
      });
      setTagInput("");
      setHint(null);
    },
    [tags, setValue, canAddMore, normalize],
  );

  /** 선택된 태그를 목록에서 제거합니다. */
  const removeTag = useCallback(
    (t: string) => {
      setValue(
        "tags",
        tags.filter((x) => x !== t),
        { shouldDirty: true, shouldValidate: true },
      );
      setHint(null);
    },
    [tags, setValue],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === "Backspace" && !tagInput && tags.length) {
      e.preventDefault();
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <FormField
      control={control}
      name="tags"
      render={() => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            태그
            <span className="text-[11px] text-muted-foreground font-normal">
              최대 {MAX_TAGS}개
            </span>
          </FormLabel>

          <FormControl>
            <div className="flex gap-2">
              <Input
                placeholder="태그 입력 후 Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={onKeyDown}
                aria-label="태그 입력"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addTag(tagInput)}
                disabled={!canAddMore || !tagInput.trim()}
              >
                <TagIcon className="size-4" />
              </Button>
            </div>
          </FormControl>

          {!!tags.length && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((t) => (
                <TagBadge key={t} text={t} onRemove={() => removeTag(t)} />
              ))}
            </div>
          )}

          <div
            className={cn(
              "mt-1 text-[11px]",
              hint ? "text-amber-600" : "text-muted-foreground",
            )}
            aria-live="polite"
          >
            {hint ??
              "Enter로 추가, 입력 비었을 때 Backspace로 마지막 태그 제거"}
          </div>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

/** 단일 태그 표시를 위한 뱃지 컴포넌트입니다. */
function TagBadge({ text, onRemove }: { text: string; onRemove: () => void }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full border border-border/70",
        "bg-muted/40 px-2.5 py-1",
        "hover:bg-muted/60 transition-colors",
      )}
    >
      <span className="text-foreground/90"># {text}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${text} 태그 제거`}
        className={cn(
          "ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full",
          "text-muted-foreground/80 hover:text-foreground hover:bg-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "transition-opacity opacity-0 group-hover:opacity-100",
        )}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </Badge>
  );
}

export default FormFieldTag;
