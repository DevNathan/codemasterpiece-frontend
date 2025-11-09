"use client";

import { useAuth } from "@/contexts/UserContext";
import { Button } from "@/shared/components/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/shadcn/tooltip";
import { Pencil } from "lucide-react";
import React, { useMemo } from "react";

type Props = {
  actorId: string;
  anon: boolean;
  onEdit: () => void;
};

export default function EditToggleButton({ actorId, anon, onEdit }: Props) {
  const { user } = useAuth();
  const isAuthorRole = user?.role === "AUTHOR";
  const isOwner = useMemo(
    () => Boolean(user?.userId) && user!.userId === actorId,
    [user?.userId, actorId],
  );
  const modifiable = Boolean(anon) || isOwner || isAuthorRole;
  if (!modifiable) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-full hover:bg-accent"
          aria-label="댓글 수정"
          onClick={onEdit}
        >
          <Pencil width={18} height={18} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" align="center">
        댓글 수정
      </TooltipContent>
    </Tooltip>
  );
}
