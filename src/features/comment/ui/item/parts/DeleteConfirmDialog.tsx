"use client";

import React, { useMemo } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/shadcn/dialog";
import { Input } from "@/shared/components/shadcn/input";
import { Button } from "@/shared/components/shadcn/button";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/shadcn/tooltip";
import { Trash2 } from "lucide-react";
import { useCommentContext } from "@/features/comment/context/CommentContext";

type Props = {
  commentId: string;
  needPassword: boolean;
  className?: string;
  iconSize?: number;
  tooltip?: string;
  buttonAriaLabel?: string;
};

function makeSchema(needPwd: boolean) {
  return z
    .object({
      guestPassword: z
        .union([
          z.string().regex(/^\d{6}$/, "비밀번호는 숫자 6자리여야 합니다."),
          z.literal(""),
          z.undefined(),
        ])
        .transform((v) =>
          typeof v === "string" && v.trim() === "" ? undefined : v,
        ),
    })
    .superRefine((val, ctx) => {
      if (needPwd && !val.guestPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["guestPassword"],
          message: "익명 글은 비밀번호가 필요합니다.",
        });
      }
    });
}

export default function DeleteConfirmDialog({
  commentId,
  needPassword,
  className,
  iconSize = 18,
  tooltip = "댓글 삭제",
  buttonAriaLabel = "댓글 삭제",
}: Props) {
  const { remove } = useCommentContext();

  const schema = useMemo(() => makeSchema(needPassword), [needPassword]);
  const form = useForm<z.infer<ReturnType<typeof makeSchema>>>({
    resolver: zodResolver(schema),
    defaultValues: { guestPassword: "" },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    setError,
  } = form;

  const onOpenChange = (v: boolean) => {
    if (!v) reset({ guestPassword: "" });
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await remove(commentId, {
        form,
        password: needPassword ? data.guestPassword : undefined,
        needPassword,
        fallbackContent: "[deleted]",
      });
      // 성공 시: 컨텍스트가 낙관적 반영 + 토스트 처리
    } catch (e: any) {
      setError("guestPassword", {
        type: "manual",
        message: e?.message ?? "삭제 중 오류가 발생했습니다.",
      });
    }
  });

  const canSubmit = !isSubmitting && (!needPassword || isValid);

  return (
    <Dialog onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-full hover:bg-destructive/10",
                className,
              )}
              aria-label={buttonAriaLabel}
            >
              <Trash2 width={iconSize} height={iconSize} />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          {tooltip}
        </TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>댓글을 삭제하시겠습니까?</DialogTitle>
          <DialogDescription>
            이 작업은 되돌릴 수 없습니다.{" "}
            {needPassword
              ? "익명 댓글 삭제를 위해 비밀번호가 필요합니다."
              : "확인을 누르면 즉시 삭제됩니다."}
          </DialogDescription>
        </DialogHeader>

        {needPassword && (
          <form
            onSubmit={onSubmit}
            className="grid gap-2 py-2"
            noValidate
            id="comment-delete-form"
          >
            <label htmlFor="cmt-del-pw" className="text-sm font-medium">
              비밀번호
            </label>
            <Input
              id="cmt-del-pw"
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="댓글 작성 시 설정한 비밀번호(숫자 6자리)"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.guestPassword)}
              aria-describedby={
                errors.guestPassword ? "cmt-del-err" : undefined
              }
              className={cn(
                errors.guestPassword &&
                  "border-destructive focus-visible:ring-destructive",
              )}
              {...register("guestPassword")}
            />
            {errors.guestPassword && (
              <p id="cmt-del-err" className="text-sm text-destructive mt-1">
                {errors.guestPassword.message as string}
              </p>
            )}
          </form>
        )}

        <DialogFooter className="gap-2 sm:gap-3">
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              취소
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={() =>
              needPassword
                ? onSubmit()
                : remove(commentId, {
                    form, // ★ 비밀번호 없어도 form은 항상 보낸다
                    fallbackContent: "[deleted]",
                    needPassword: false,
                  })
            }
            disabled={!canSubmit}
            form={needPassword ? "comment-delete-form" : undefined}
          >
            {isSubmitting ? "삭제 중..." : "삭제하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
