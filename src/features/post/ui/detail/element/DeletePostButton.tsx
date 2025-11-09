"use client";

import React, { useCallback, useRef, useState } from "react";
import { Button } from "@/shared/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/shadcn/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/shadcn/tooltip";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import deletePost from "@/features/post/api/deletePost";
import { cn } from "@/lib/utils";
import { isSuccess } from "@/lib/api/clientFetch";
import { formatKoreanDateTime } from "@/lib/util/timeFormatter";

type DeletePostButtonProps = {
  postId: string;
  title?: string;
  className?: string;
  onDeleted?: () => void; // 성공 후 라우팅 등
};

const DeletePostButton: React.FC<DeletePostButtonProps> = ({
  postId,
  title,
  className,
  onDeleted,
}) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // 네비 시작 플래그: 라우팅 중엔 어떤 "열기" 신호도 무시
  const navigatingRef = useRef(false);

  const closeThen = (fn?: () => void) => {
    // 1) 먼저 닫기
    setOpen(false);
    // 2) 다음 프레임/틱에서 사이드이펙트 실행 → 포커스/portal 정리 후 이동
    requestAnimationFrame(() => {
      setTimeout(() => fn?.(), 0);
    });
  };

  const handleDelete = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    const res = await deletePost(postId);

    if (!isSuccess(res)) {
      const {
        error: { message },
        timestamp,
      } = res;
      setBusy(false);
      toast.error(message, {
        description: formatKoreanDateTime(new Date(timestamp)),
      });
      return;
    }

    const {
      detail: { message },
      timestamp,
    } = res;
    toast.success(message, {
      description: formatKoreanDateTime(new Date(timestamp)),
    });

    // 라우팅 전환 시작 표시
    navigatingRef.current = true;

    // 닫고 난 뒤 다음 프레임에 onDeleted 실행(예: router.push)
    closeThen(() => {
      try {
        onDeleted?.();
      } finally {
        setBusy(false);
      }
    });
  }, [busy, postId, onDeleted]);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setOpen(true)}
            className={cn(className)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            삭제
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">영구 삭제</TooltipContent>
      </Tooltip>

      {/* 닫히면 아예 언마운트해서 재오픈 트리거 무력화 */}
      {open && (
        <Dialog
          open={open}
          onOpenChange={(o) => {
            // 라우팅 중엔 열기 신호 무시, 닫기만 반영
            if (!o) setOpen(false);
            else if (!navigatingRef.current) setOpen(true);
          }}
        >
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>정말 삭제하시겠습니까?</DialogTitle>
              <DialogDescription>
                이 작업은 되돌릴 수 없습니다.
                {title ? (
                  <>
                    {" "}
                    <strong>{title}</strong> 게시글을 영구적으로 삭제합니다.
                  </>
                ) : (
                  " 선택한 게시글을 영구적으로 삭제합니다."
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                취소
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={busy}
              >
                {busy ? "삭제 중…" : "영구 삭제"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default DeletePostButton;
