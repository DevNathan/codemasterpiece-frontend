"use client";

import { CommentDTO } from "@/features/comment/type/CommentDTO";
import { useAuth } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";
import React, { useMemo, useState } from "react";
import {
  formatToYearMonthDay,
  getTimeGapFromNow,
} from "@/lib/util/timeFormatter";
import CommentHeader from "@/features/comment/ui/item/parts/CommentHeader";
import ReplyButtonWithDropdown from "@/features/comment/ui/item/parts/ReplyButtonWithDropdown";
import ReactionBar from "@/features/comment/ui/item/parts/ReactionBar";
import Children from "@/features/comment/ui/item/parts/Children";
import { Button } from "@/shared/components/shadcn/button";
import { Loader2, Pencil } from "lucide-react";
import CommentContent from "@/features/comment/ui/item/CommentContent";
import CommentEditForm from "@/features/comment/ui/form/CommentEditForm";
import DeleteConfirmDialog from "@/features/comment/ui/item/parts/DeleteConfirmDialog";
import { toast } from "sonner";
import getRawComment from "@/features/comment/api/getRawComment";
import HideToggleButton from "@/features/comment/ui/item/parts/HideToggleButton";

export default function CommentItem({ comment }: { comment: CommentDTO }) {
  const { user } = useAuth();
  const [isEditing, setEditing] = useState(false);
  const [isFetchingRaw, setIsFetchingRaw] = useState(false);
  const [rawContent, setRawContent] = useState<string | null>(null);

  const {
    commentId,
    actorId,
    profileImage,
    nickname,
    content,
    reaction,
    myReaction,
    depth,
    createdAt,
    hidden,
    deleted,
    children,
    anon,
  } = comment;

  const isAuthorRole = useMemo(() => user?.role === "AUTHOR", [user?.role]);
  const isOwner = useMemo(
    () => user?.userId === actorId,
    [user?.userId, actorId],
  );
  const modifiable = Boolean(anon) || isOwner || isAuthorRole;
  const needPassword = Boolean(anon) && !isOwner && !isAuthorRole;

  const handleStartEdit = async () => {
    // rawContent가 null일 때만 새로 페치한다.
    if (rawContent !== null) {
      setEditing(true);
      return;
    }

    try {
      setIsFetchingRaw(true);
      const res = await getRawComment({ commentId });
      if (res.data) {
        setRawContent(res.data);
        setEditing(true);
      }
    } catch {
      toast.error("원본 데이터를 가져오지 못했습니다.");
    } finally {
      setIsFetchingRaw(false);
    }
  };

  return (
    <li className="block w-full box-border">
      <div
        className={cn(
          "flex gap-3 items-stretch bg-sidebar rounded-xl px-3 py-3 shadow-sm w-full border-border border-b",
          { "ml-4": depth > 0 },
        )}
      >
        <ReactionBar
          commentId={commentId}
          score={reaction}
          myReaction={myReaction}
        />

        <div className="flex flex-1 flex-col gap-2">
          <CommentHeader
            profileImage={profileImage}
            nickname={nickname}
            timeText={getTimeGapFromNow(
              new Date(createdAt),
              formatToYearMonthDay,
            )}
            deleted={deleted}
            hidden={hidden}
          />

          {!isEditing ? (
            <CommentContent content={content} />
          ) : (
            <CommentEditForm
              commentId={commentId}
              actorId={actorId}
              initialContent={rawContent || ""}
              anon={anon}
              needPassword={needPassword}
              onCloseAction={() => {
                setEditing(false);
                setRawContent(null);
              }}
              className="mt-2"
            />
          )}

          {/* 하단 액션 버튼 영역 */}
          <div className="flex justify-end mt-2 gap-1">
            {/* 수정/숨김/삭제는 권한(modifiable)이 필요함 */}
            {!deleted && modifiable && !isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleStartEdit}
                  disabled={isFetchingRaw}
                >
                  {isFetchingRaw ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Pencil width={18} height={18} />
                  )}
                </Button>
                <HideToggleButton commentId={commentId} hidden={hidden} />
                <DeleteConfirmDialog
                  commentId={commentId}
                  needPassword={needPassword}
                />
              </>
            )}

            {/* 대댓글은 권한과 무관하게 삭제/숨김이 아닐 때 노출 */}
            {!deleted && !hidden && !isEditing && (
              <ReplyButtonWithDropdown
                nickname={nickname}
                parentId={commentId}
              />
            )}
          </div>
        </div>
      </div>
      {children.length > 0 && <Children items={children} />}
    </li>
  );
}
