"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/shadcn/dialog";
import { Button } from "@/shared/components/shadcn/button";

type Props = {
  open: boolean;
  etaMs: number;
  hardExpired: boolean;
  loading: boolean;
  extendAction: () => void;
  reloginAction: () => void;
  dismissAction?: () => void;
};

function fmt(ms: number) {
  const s = Math.max(Math.floor(ms / 1000), 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export default function SessionExpiryDialog({
  open,
  etaMs,
  hardExpired,
  loading,
  extendAction,
  reloginAction,
  dismissAction,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) dismissAction?.();
      }}
    >
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>세션 만료 {hardExpired ? "됨" : "임박"}</DialogTitle>
          <DialogDescription>
            {hardExpired
              ? "세션이 만료되었습니다. 작성 중인 내용은 임시저장으로 보호됩니다."
              : "세션이 곧 만료됩니다. 연장을 누르면 계속 작성할 수 있습니다."}
          </DialogDescription>
        </DialogHeader>

        {!hardExpired && (
          <div className="mt-2 text-sm text-muted-foreground">
            예상 남은 시간: <span className="font-mono">{fmt(etaMs)}</span>
          </div>
        )}

        <DialogFooter className="gap-2">
          {!hardExpired ? (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={dismissAction}
                disabled={loading}
              >
                나중에
              </Button>
              <Button type="button" onClick={extendAction} disabled={loading}>
                {loading ? "연장 시도…" : "세션 연장"}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={dismissAction}>
                닫기
              </Button>
              <Button type="button" onClick={reloginAction}>
                다시 로그인
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
