"use client";

import { CommentDTO } from "@/features/comment/type/CommentDTO";
import { useAuth } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";
import React, { useMemo, useState } from "react";
import {
  formatToYearMonthDay,
  getTimeGapFromNow,
} from "@/lib/util/timeFormatter";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/shadcn/avatar";
import CommentHeader from "@/features/comment/ui/item/parts/CommentHeader";
import ReplyButtonWithDropdown from "@/features/comment/ui/item/parts/ReplyButtonWithDropdown";
import ReactionBar from "@/features/comment/ui/item/parts/ReactionBar";
import Children from "@/features/comment/ui/item/parts/Children";
import HideToggleButton from "@/features/comment/ui/item/parts/HideToggleButton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/shadcn/tooltip";
import { Button } from "@/shared/components/shadcn/button";
import { Pencil } from "lucide-react";
import CommentContent from "@/features/comment/ui/item/CommentContent";
import CommentEditForm from "@/features/comment/ui/item/CommentEditForm";
import DeleteConfirmDialog from "@/features/comment/ui/item/parts/DeleteConfirmDialog";

type Props = { comment: CommentDTO };

export default function CommentItem({ comment }: Props) {
  const { user } = useAuth();

  const [isEditing, setEditing] = useState(false);

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

  const indentDepth = Math.min(depth, 2);
  const isAuthorRole = useMemo(() => user?.role === "AUTHOR", [user?.role]);
  const isOwner = useMemo(
    () => Boolean(user?.userId) && user!.userId === actorId,
    [user?.userId, actorId],
  );

  // 삭제/수정 노출: 익명 || 본인 || AUTHOR
  const modifiable = Boolean(anon) || isOwner || isAuthorRole;

  // 익명 + 비소유자 + 비AUTHOR → 비번 필요
  const needPassword = Boolean(anon) && !isOwner && !isAuthorRole;

  return (
    <li className="block w-full box-border">
      <div
        className={cn(
          "flex gap-3 sm:gap-4 items-stretch bg-sidebar rounded-xl px-4 py-3 sm:px-5 sm:py-4 shadow-sm w-full border-border border-b",
          {
            "ml-4": indentDepth > 0,
            "pl-2 sm:pl-4": indentDepth === 1,
            "pl-4 sm:pl-6": indentDepth === 2,
          },
        )}
      >
        <ReactionBar
          commentId={commentId}
          score={reaction}
          myReaction={myReaction}
        />

        {/* 아바타 */}
        <Avatar className="w-12 h-12 sm:w-14 sm:h-14 shrink-0">
          <AvatarImage src={profileImage} alt={nickname} />
          <AvatarFallback className="text-[11px] font-semibold">
            {nickname.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* 본문 */}
        <div className="flex flex-col justify-center h-full flex-1">
          <CommentHeader
            nickname={nickname}
            timeText={getTimeGapFromNow(
              new Date(createdAt),
              formatToYearMonthDay,
            )}
            deleted={deleted}
            hidden={hidden}
          />

          {/* 콘텐츠 or 수정 폼 — 내부에서 자체 상태 관리 */}
          {!isEditing ? (
            <CommentContent
              content={content}
              className={cn(
                "prose prose-sm sm:prose-base max-w-none mt-1 transition-colors",
                deleted && "text-muted-foreground",
                !deleted && hidden && "text-muted-foreground",
              )}
            />
          ) : (
            <CommentEditForm
              commentId={commentId}
              actorId={actorId}
              initialContent={content}
              anon={anon}
              needPassword={needPassword}
              onCloseAction={() => setEditing(false)}
              className="mt-2"
            />
          )}

          {!deleted && (
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 mt-2">
              {isAuthorRole && (
                <HideToggleButton commentId={commentId} hidden={hidden} />
              )}

              {modifiable && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-full hover:bg-accent"
                        aria-label="댓글 수정"
                        onClick={() => setEditing(true)}
                      >
                        <Pencil width={18} height={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      댓글 수정
                    </TooltipContent>
                  </Tooltip>

                  <DeleteConfirmDialog
                    commentId={commentId}
                    needPassword={needPassword}
                  />
                </>
              )}

              <ReplyButtonWithDropdown
                nickname={nickname}
                parentId={commentId}
              />
            </div>
          )}
        </div>
      </div>

      {/* 자식 */}
      {children.length > 0 && <Children items={children} />}
    </li>
  );
}
