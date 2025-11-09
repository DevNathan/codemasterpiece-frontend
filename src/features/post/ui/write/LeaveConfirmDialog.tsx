"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/shadcn/dialog";
import { Button } from "@/shared/components/shadcn/button";

interface Props {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const LeaveConfirmDialog = ({ open, onCancel, onConfirm }: Props) => (
  <Dialog open={open} onOpenChange={onCancel}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>작성 중인 내용이 있습니다</DialogTitle>
        <DialogDescription>
          현재 입력 중인 데이터가 저장되지 않았습니다. 페이지를 떠나면 작성
          내용이 사라집니다.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          머물기
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          떠나기
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default LeaveConfirmDialog;
