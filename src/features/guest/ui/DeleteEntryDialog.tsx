"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/shared/components/shadcn/dialog";
import { Input } from "@/shared/components/shadcn/input";
import { Button } from "@/shared/components/shadcn/button";
import React from "react";
import type { UseFormReturn } from "react-hook-form";
import type { DeleteEntrySchema } from "@/features/guest/schemas/deleteEntrySchema";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  needPassword: boolean;
  /** RHF 폼: 서버/클라 밸리데이션을 한 곳으로 수렴 */
  form: UseFormReturn<DeleteEntrySchema>;
  /** 최종 확정 콜백(부모에서 API 호출) */
  onConfirm: () => void;
};

export default function DeleteEntryDialog({
                                            open,
                                            setOpen,
                                            needPassword,
                                            form,
                                            onConfirm,
                                          }: Props) {
  const {
    register,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = form;

  const canSubmit =
    !isSubmitting &&
    (!needPassword ||
      (getValues("guestPassword")?.trim().length ?? 0) > 0);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        // 닫힐 때 에러/값 초기화
        if (!v) setValue("guestPassword", "");
      }}
    >
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>정말 삭제할까요?</DialogTitle>
          <DialogDescription>
            이 작업은 되돌릴 수 없습니다.{" "}
            {needPassword
              ? "익명 작성자의 게시물 삭제에는 비밀번호가 필요합니다."
              : "확인을 누르면 즉시 삭제됩니다."}
          </DialogDescription>
        </DialogHeader>

        {needPassword && (
          <div className="grid gap-2 py-2">
            <label htmlFor="entry-del-pw" className="text-sm font-medium">
              비밀번호
            </label>
            <Input
              id="entry-del-pw"
              type="password"
              placeholder="작성 시 입력한 비밀번호"
              autoFocus
              {...register("guestPassword")}
              className={cn(
                "h-9 text-sm",
                errors.guestPassword && "border-destructive focus-visible:ring-destructive"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit) onConfirm();
              }}
              disabled={isSubmitting}
            />
            {errors.guestPassword && (
              <p className="text-sm text-destructive">
                {String(errors.guestPassword.message)}
              </p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-3">
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              취소
            </Button>
          </DialogClose>

          <Button variant="destructive" onClick={onConfirm} disabled={!canSubmit}>
            {isSubmitting ? "삭제 중..." : "삭제하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
