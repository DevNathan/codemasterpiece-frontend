"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { EntryDTO } from "@/features/guest/types/EntryDTO";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/components/shadcn/tooltip";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/shadcn/avatar";
import {
  formatKoreanDateTime,
  formatToYearMonthDay,
  getTimeGapFromNow,
} from "@/lib/util/timeFormatter";
import { useAuth } from "@/contexts/UserContext";
import DraftEntry from "@/features/guest/ui/DraftEntry";
import editEntry from "@/features/guest/api/editEntry";
import { deleteEntry } from "@/features/guest/api/deleteEntry";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  editEntrySchema,
  EditEntrySchema,
} from "@/features/guest/schemas/entryUpdateSchema";
import {
  deleteEntrySchema,
  DeleteEntrySchema,
} from "@/features/guest/schemas/deleteEntrySchema";
import { isSuccess } from "@/lib/api/clientFetch";
import { toast } from "sonner";
import { useGuestbook } from "@/features/guest/context/GuestbookContext";
import DeleteEntryDialog from "@/features/guest/ui/DeleteEntryDialog";

type Props = { entry: EntryDTO };

export default function EntryBubble({ entry }: Props) {
  const {
    entryId,
    provider,
    content,
    nickname,
    profileImage,
    author,
    createdAt,
    updatedAt,
    actorId,
  } = entry;

  const { updateEntry, deleteEntryFromCache } = useGuestbook();
  const { user, isAuthor } = useAuth();

  const alignRight = author;
  const canManage = provider === "ANON" || user?.userId === actorId || isAuthor;

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // === RHF: EDIT FORM (유지 필수) ===
  const editForm = useForm<EditEntrySchema>({
    resolver: zodResolver(editEntrySchema),
    mode: "onChange",
    defaultValues: { entryId, content, provider, isAuthor, guestPassword: "" },
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
    watch,
  } = editForm;

  // === RHF: DELETE FORM (다이얼로그용 경량 폼) ===
  const deleteForm = useForm<DeleteEntrySchema>({
    resolver: zodResolver(deleteEntrySchema),
    mode: "onChange",
    defaultValues: {
      entryId,
      provider,
      isAuthor,
      guestPassword: "",
    },
  });

  // 편집 모드 진입 시 최신 값으로 reset
  useEffect(() => {
    if (isEditing) {
      reset({
        entryId,
        content,
        provider,
        isAuthor,
        guestPassword: "",
      });
    }
  }, [isEditing, entryId, content, provider, isAuthor, reset]);

  // EDIT
  const onSubmitEdit = async (values: EditEntrySchema) => {
    const res = await editEntry(editForm, values);
    if (!isSuccess(res)) {
      const {
        timestamp,
        error: { code, message },
      } = res;
      if (code !== "error.validation") {
        toast.error(message, {
          description: formatKoreanDateTime(new Date(timestamp)),
        });
      }
      return;
    }
    const {
      data,
      timestamp,
      detail: { message },
    } = res;
    updateEntry(data!);
    setIsEditing(false);
    toast.success(message, {
      description: formatKoreanDateTime(new Date(timestamp)),
    });
  };

  // DELETE
  const onConfirmDelete = async () => {
    const values = deleteForm.getValues();
    const res = await deleteEntry(deleteForm, {
      entryId,
      provider,
      isAuthor,
      guestPassword: values.guestPassword || undefined,
    });

    if (!isSuccess(res)) {
      if (res.error.code !== "error.validation") {
        toast.error(res.error.message, {
          description: formatKoreanDateTime(new Date(res.timestamp)),
        });
      }
      return;
    }

    const {
      detail: { message },
      timestamp,
    } = res;

    deleteEntryFromCache(entryId);
    toast.success(message, {
      description: formatKoreanDateTime(new Date(timestamp)),
    });
    setShowDeleteDialog(false);
    // 폼 클린업
    deleteForm.reset({ ...deleteForm.getValues(), guestPassword: "" });
  };

  // === Edited 표시 계산 ===
  const createdDate = new Date(createdAt);
  const updatedDate = updatedAt ? new Date(updatedAt) : null;
  const isEdited =
    !!updatedDate && updatedDate.getTime() !== createdDate.getTime();

  const fallback = (nickname ?? "?").slice(0, 2).trim() || "?";

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex w-full",
          alignRight ? "justify-end" : "justify-start",
        )}
      >
        <div
          className={cn(
            "relative flex w-full min-w-0 items-end gap-3",
            alignRight ? "flex-row-reverse" : "flex-row",
          )}
        >
          <Avatar className="h-10 w-10 shrink-0 ring-2 ring-border">
            <AvatarImage src={profileImage} alt={nickname ?? "avatar"} />
            <AvatarFallback className="bg-muted text-xs font-medium">
              {fallback}
            </AvatarFallback>
          </Avatar>

          <div
            className={cn(
              "relative rounded-2xl p-[1px] bg-gradient-to-br min-w-0",
              !isEditing && "max-w-[640px]",
              isEditing && "flex-1 max-w-[960px]",
              alignRight
                ? "from-point/70 via-point/25 to-transparent"
                : "from-foreground/15 via-foreground/10 to-transparent",
            )}
          >
            <div className="rounded-[16px] border bg-background/80 px-4 py-3 shadow-sm backdrop-blur">
              <header
                className={cn(
                  "mb-2 flex justify-between gap-4",
                  alignRight && "flex-row-reverse",
                )}
              >
                <div>
                  <span className="text-sm font-semibold break-all">
                    {nickname}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {/* 생성 시각(상대표기) */}
                    <time
                      className="block text-[11px] text-muted-foreground"
                      title={formatToYearMonthDay(createdDate)}
                    >
                      {getTimeGapFromNow(createdDate, formatToYearMonthDay)}
                    </time>

                    {/* 수정됨 뱃지 + 툴팁(최종 수정 시각) */}
                    {isEdited && updatedDate && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center rounded-full border border-border/70 px-1.5 py-[1px] text-[10px] leading-none text-muted-foreground hover:bg-muted/60 cursor-default">
                            수정됨
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          최종 수정: {formatKoreanDateTime(updatedDate)}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>

                {canManage && !isEditing && (
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="size-8 border rounded-full flex items-center justify-center hover:bg-muted/60"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>수정</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            // 다이얼로그 열 때 삭제 폼 초기화
                            deleteForm.reset({
                              entryId,
                              provider,
                              isAuthor,
                              guestPassword: "",
                            });
                            setShowDeleteDialog(true);
                          }}
                          className="size-8 border rounded-full flex items-center justify-center hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>삭제</TooltipContent>
                    </Tooltip>
                  </div>
                )}

                {canManage && isEditing && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      disabled={isSubmitting}
                      className="inline-flex h-8 items-center gap-1 rounded-full border border-border/60 px-3 text-xs hover:bg-muted/60 disabled:opacity-60"
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" /> 취소
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmit(onSubmitEdit)}
                      disabled={isSubmitting || !isValid}
                      className="inline-flex h-8 items-center gap-1 rounded-full border border-border/60 bg-point/90 px-3 text-xs text-point-foreground hover:bg-point disabled:opacity-60"
                    >
                      <Check className="mr-1.5 h-3.5 w-3.5" /> 저장
                    </button>
                  </div>
                )}
              </header>

              {!isEditing ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                  {content}
                </p>
              ) : (
                <DraftEntry
                  provider={provider}
                  isAuthor={isAuthor}
                  register={register}
                  errors={errors}
                  watch={watch}
                />
              )}
            </div>
          </div>
        </div>
      </motion.article>

      {/* 삭제 다이얼로그: RHF 폼 주입 */}
      <DeleteEntryDialog
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        needPassword={
          provider === "ANON" && !isAuthor && user?.userId !== actorId
        }
        form={deleteForm}
        onConfirm={onConfirmDelete}
      />
    </>
  );
}
