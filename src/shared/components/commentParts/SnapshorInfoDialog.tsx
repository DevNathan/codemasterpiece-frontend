"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/shadcn/dialog";
import { Separator } from "@/shared/components/shadcn/separator";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Info } from "lucide-react";

export default function SnapshotInfoDialog({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm p-0 bg-transparent border-none shadow-none">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl",
            "border border-border/60 bg-background/70 backdrop-blur-xl",
            "shadow-[0_12px_50px_rgba(0,0,0,0.18)] ring-1 ring-black/5",
            "before:absolute before:inset-[-2px] before:-z-10 before:rounded-[22px]",
            "before:bg-[radial-gradient(120%_120%_at_0%_0%,theme(colors.point/20),transparent_65%)]",
            "after:pointer-events-none after:absolute after:inset-0 after:rounded-[22px] after:ring-1 after:ring-white/5",
          )}
        >
          <div className="p-5 sm:p-6">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-point/15 ring-1 ring-point/30">
                  <Info className="h-3.5 w-3.5 text-point" />
                </span>
                닉네임 스냅샷 안내
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                댓글에는 작성 시점의 닉네임과 프로필 이미지가 저장됩니다. 이후
                프로필을 변경해도 기존 댓글의 표기는 당시 상태로 유지됩니다.
              </DialogDescription>
            </DialogHeader>
            <Separator className="my-4" />
            <div className="space-y-3 text-sm">
              <p>
                이 블로그는 개인정보 최소 수집 원칙을 따릅니다. 계정 고유 정보나
                이메일 등은 저장하지 않습니다.
              </p>
              <p>
                댓글 정보는 닉네임·아바타 스냅샷으로만 보관되며, 필요한 경우{" "}
                <b>익명 댓글</b>을 선택하실 수 있습니다.
              </p>
            </div>
            <div className="pointer-events-none mt-5 h-px w-full bg-gradient-to-r from-transparent via-point/60 to-transparent" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
