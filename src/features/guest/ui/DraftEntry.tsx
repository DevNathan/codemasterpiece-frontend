"use client";

import { Textarea } from "@/shared/components/shadcn/textarea";
import { Input } from "@/shared/components/shadcn/input";
import { cn } from "@/lib/utils";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";
import { EditEntrySchema } from "@/features/guest/schemas/entryUpdateSchema";

type DraftEntryProps = {
  provider: EditEntrySchema["provider"];
  isAuthor: boolean;
  register: UseFormRegister<EditEntrySchema>;
  errors: FieldErrors<EditEntrySchema>;
  watch: UseFormWatch<EditEntrySchema>;
  className?: string;
};

export default function DraftEntry({
  provider,
  isAuthor,
  register,
  errors,
  watch,
  className,
}: DraftEntryProps) {
  const content = watch("content") ?? "";
  const showPassword = provider === "ANON" && !isAuthor;

  const contentError = !!errors.content;
  const passwordError = !!errors.guestPassword;

  return (
    <div className={cn("space-y-2 w-full min-w-0", className)}>
      <Textarea
        {...register("content")}
        rows={Math.min(16, Math.max(6, Math.ceil((content.length ?? 0) / 48)))}
        className={cn(
          "text-sm w-full min-w-0 min-h-[180px] leading-relaxed resize-none",
          contentError &&
            "border-destructive ring-1 ring-destructive focus-visible:ring-destructive",
        )}
        placeholder="내용을 입력하세요…"
      />
      {errors.content && (
        <p className="text-xs text-destructive">
          {String(errors.content.message)}
        </p>
      )}

      <p className="text-[11px] text-muted-foreground">Shift+Enter 줄바꿈</p>

      {showPassword && (
        <div className="pt-1">
          <label className="mb-1 block text-xs text-muted-foreground">
            비밀번호 (익명 작성자)
          </label>
          <Input
            type="password"
            autoComplete="current-password"
            className={cn(
              "h-9 text-sm",
              passwordError &&
                "border-destructive ring-1 ring-destructive focus-visible:ring-destructive",
            )}
            placeholder="익명 글 수정/삭제용 비밀번호"
            {...register("guestPassword")}
          />
          {errors.guestPassword && (
            <p className="text-xs text-destructive mt-1">
              {String(errors.guestPassword.message)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
