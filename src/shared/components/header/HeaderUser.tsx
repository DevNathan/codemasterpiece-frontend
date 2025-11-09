"use client";

import React from "react";
import { Button } from "@/shared/components/shadcn/button";
import { UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/UserContext";
import UserDropdown from "@/shared/components/header/UserDropdown";
import { useAuthDialog } from "@/contexts/AuthDialogProvider";

const HeaderUser = () => {
  const { user } = useAuth();
  const { openDialog } = useAuthDialog();

  return user ? (
    <UserDropdown user={user} />
  ) : (
    <Button
      className="flex items-center justify-center gap-2 px-2 sm:px-4"
      type="button"
      onClick={openDialog}
    >
      <div className="size-5 rounded-full bg-background flex items-center justify-center">
        <UserIcon className="size-4 fill-primary" />
      </div>
      <span className="hidden lg:inline">로그인</span>
    </Button>
  );
};

export default HeaderUser;
