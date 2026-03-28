import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/shadcn/avatar";
import { AppUser } from "@/features/auth/types/AppUser";

type Props = { user: AppUser };

export default function HeaderUser({ user }: Props) {
  const isAuthor = user.role === "AUTHOR";

  return (
    <div className="px-3 pt-3 pb-2 flex items-center gap-3">
      <Avatar className="size-9 ring-1 ring-border/80 shadow-sm">
        <AvatarImage
          src={user.avatarUrlSmall}
          alt={user.nickname}
        />
        <AvatarFallback className="text-[11px] font-semibold">
          {user.nickname.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="text-sm font-semibold truncate">{user.nickname}</div>
        <div className="text-[11px] text-muted-foreground tracking-wide">
          {isAuthor ? "AUTHOR" : "READER"}
        </div>
      </div>
    </div>
  );
}
