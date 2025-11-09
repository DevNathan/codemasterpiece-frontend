"use client";

import { useAuth } from "@/contexts/UserContext";
import { useState } from "react";
import { Ellipsis, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/shadcn/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/shared/components/shadcn/dropdown-menu";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/shared/components/shadcn/dialog";
import FolderForm from "@/shared/components/nav/form/FolderForm";
import CategoryForm from "@/shared/components/nav/form/CategoryForm";
import CategoryUpdateForm from "@/shared/components/nav/form/CategoryUpdateForm";
import deleteCategory from "@/features/category/api/deleteCategory";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/shared/components/shadcn/alert-dialog";
import { isSuccess } from "@/lib/api/clientFetch";
import { formatKoreanDateTime } from "@/lib/util/timeFormatter";
import useCategoryTree from "@/features/category/hooks/useCategoryTree";
import type { CategoryDTO } from "@/features/category/types/CategoryDTO";

type Props = {
  categoryId?: string;
  categoryType?: "FOLDER" | "LINK";
  category?: CategoryDTO;
};

export default function CategoryDropdown({ categoryId, categoryType, category }: Props) {
  const { user } = useAuth();
  const { invalidate } = useCategoryTree();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"FOLDER" | "CATEGORY" | "EDIT" | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!user || user.role !== "AUTHOR") return null;

  const canCreateChildren = !categoryId || categoryType === "FOLDER";

  const onClickDelete = () => {
    if (!categoryId) return;
    setConfirmOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!categoryId) return;
    setDeleting(true);
    const res = await deleteCategory(categoryId);

    if (!isSuccess(res)) {
      const { error: { message }, timestamp } = res;
      toast.error(message, { description: formatKoreanDateTime(new Date(timestamp)) });
      setDeleting(false);
      return;
    }

    const { timestamp, detail: { message } } = res;
    toast.success(message, { description: formatKoreanDateTime(new Date(timestamp)) });
    setConfirmOpen(false);
    setDialogOpen(false);
    setDeleting(false);
    invalidate();
  };

  return (
    <>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setDialogType(null);
        }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" aria-label="카테고리 옵션">
              <Ellipsis className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {canCreateChildren && (
              <>
                <DropdownMenuItem onClick={() => { setDialogType("FOLDER"); setDialogOpen(true); }}>
                  폴더 추가
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setDialogType("CATEGORY"); setDialogOpen(true); }}>
                  카테고리 추가
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {categoryId && (
              <>
                <DropdownMenuItem onClick={() => { setDialogType("EDIT"); setDialogOpen(true); }}>
                  카테고리 수정
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onClickDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  해당 카테고리 삭제
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent className="sm:max-w-[425px]">
          {/* 접근성 필수 타이틀/설명 */}
          <DialogTitle>카테고리</DialogTitle>
          <DialogDescription>카테고리를 추가/수정합니다.</DialogDescription>

          {dialogType === "FOLDER" && <FolderForm parentId={categoryId} />}
          {dialogType === "CATEGORY" && <CategoryForm parentId={categoryId} />}
          {dialogType === "EDIT" && category && (
            <CategoryUpdateForm
              category={category}               // ✅ DTO 주입
              onSuccess={() => {                // ✅ 저장 후 닫기
                setDialogOpen(false);
                setDialogType(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>카테고리를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              되돌릴 수 없습니다. 하위/참조가 있으면 삭제가 차단됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  삭제 중…
                </span>
              ) : (
                "삭제"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
