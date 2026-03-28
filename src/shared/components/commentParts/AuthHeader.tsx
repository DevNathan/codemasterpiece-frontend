"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/shadcn/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/shadcn/tooltip";
import { Info } from "lucide-react";
import SnapshotInfoDialog from "@/shared/components/commentParts/SnapshorInfoDialog";
import { AppUser } from "@/features/auth/types/AppUser";

export default function AuthHeader({ user }: { user: AppUser }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-12 w-12 ring-2 ring-point/40 shadow-sm">
        <AvatarImage src={user.avatarUrlSmall} alt={user.nickname} />
        <AvatarFallback className="text-[11px] font-semibold">
          {(user.nickname).slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1.5">
        <p className="text-base sm:text-lg font-semibold tracking-tight">{user.nickname}</p>
        <SnapshotInfoDialog>
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <button type="button" aria-label="닉네임 스냅샷 안내" className="text-muted-foreground hover:text-foreground transition-colors">
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">닉네임은 댓글 작성 시 스냅샷으로 저장됩니다.</p>
            </TooltipContent>
          </Tooltip>
        </SnapshotInfoDialog>
      </div>
    </div>
  );
}