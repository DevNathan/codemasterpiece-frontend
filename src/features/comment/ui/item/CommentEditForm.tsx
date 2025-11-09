"use client";

import React, { useMemo } from "react";
import { Button } from "@/shared/components/shadcn/button";
import { Textarea } from "@/shared/components/shadcn/textarea";
import { Input } from "@/shared/components/shadcn/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/UserContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import editComment from "@/features/comment/api/editComment";
import {
  CommentEditFormValues,
  makeCommentEditFormSchema,
} from "@/features/comment/schemas/commentUpdateSchema";
import { isSuccess } from "@/lib/api/clientFetch";
import { toast } from "sonner";
import { formatKoreanDateTime } from "@/lib/util/timeFormatter";
import { useCommentContext } from "@/features/comment/context/CommentContext";

type Props = {
  commentId: string;
  initialContent: string;
  anon: boolean;
  actorId: string;
  /** 외부에서 강제 설정 시 우선 적용 */
  needPassword?: boolean;
  onCloseAction: () => void;
  className?: string;
};

export default function CommentEditForm({
  commentId,
  initialContent,
  anon,
  actorId,
  needPassword,
  onCloseAction,
  className,
}: Props) {
  const { user, isAuthor } = useAuth();
  const { updateComment } = useCommentContext();

  const computedNeedPwd = useMemo(() => {
    if (typeof needPassword === "boolean") return needPassword;
    const currentUserId = user?.userId ?? null;
    return anon && !isAuthor && currentUserId !== actorId;
  }, [needPassword, anon, isAuthor, user?.userId, actorId]);

  const schema = useMemo(
    () => makeCommentEditFormSchema(computedNeedPwd),
    [computedNeedPwd],
  );

  const form = useForm<CommentEditFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      content: initialContent,
      guestPassword: "",
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = form;

  const onSubmit = handleSubmit(async (data) => {
    const res = await editComment(form, {
      commentId,
      content: data.content.trim(),
      provider: anon ? "ANON" : "GITHUB",
      isAuthor,
      guestPassword: data.guestPassword,
    });

    if (!isSuccess(res)) {
      const {
        error: { message, code },
        timestamp,
      } = res;
      if (code !== "error.validation") {
        toast.error(message, {
          description: formatKoreanDateTime(new Date(timestamp)),
        });
      }
      return;
    }

    const {
      detail: { message },
      timestamp,
      data: dto,
    } = res;

    toast.success(message, {
      description: formatKoreanDateTime(new Date(timestamp)),
    });

    await updateComment(dto!);

    onCloseAction();
  });

  return (
    <form
      onSubmit={onSubmit}
      className={cn("flex flex-col gap-2", className)}
      noValidate
    >
      {/* 내용 */}
      <div className="flex flex-col gap-1.5">
        <Textarea
          {...register("content")}
          className={cn(
            "min-h-[120px] resize-y",
            errors.content &&
              "border-destructive focus-visible:ring-destructive",
          )}
          placeholder="내용을 입력하세요..."
          disabled={isSubmitting}
        />
        {errors.content && (
          <p className="text-destructive text-sm">{errors.content.message}</p>
        )}
      </div>

      {/* 비밀번호(조건부) */}
      {computedNeedPwd && (
        <div className="flex flex-col gap-1.5 max-w-xs">
          <Input
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="비밀번호 (숫자 6자리)"
            {...register("guestPassword")}
            disabled={isSubmitting}
            className={cn(
              errors.guestPassword &&
                "border-destructive focus-visible:ring-destructive",
            )}
          />
          {errors.guestPassword && (
            <p className="text-destructive text-sm">
              {errors.guestPassword.message as string}
            </p>
          )}
        </div>
      )}

      {/* 액션 */}
      <div className="flex items-center gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            reset({ content: initialContent, guestPassword: "" });
            onCloseAction();
          }}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button
          type="submit"
          className="bg-point text-white hover:bg-point/90 shadow-sm hover:shadow active:scale-[0.98] transition-all"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? "저장 중..." : "저장"}
        </Button>
      </div>
    </form>
  );
}
