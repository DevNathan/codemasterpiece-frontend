"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AppUser } from "@/features/auth/types/AppUser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/shadcn/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/shadcn/tooltip";
import { Button } from "@/shared/components/shadcn/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/shadcn/avatar";
import {
  Home,
  LogOut,
  PenSquare,
  RefreshCw,
  UserIcon,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { Kbd } from "@/shared/components/shadcn/kbd";
import { useAuthDialog } from "@/contexts/AuthDialogProvider";
import { usePolicyDialog } from "@/contexts/PolicyDialogProvider";
import { SiGithub } from "react-icons/si";
import { usePathname, useRouter } from "next/navigation";
import { clearAllCacheAction } from "@/features/post/action/cacheAction";
import { toast } from "sonner";

import HeaderUser from "./HeaderUser";
import HeaderGuest from "./HeaderGuest";
import HeaderAppearance from "./HeaderAppearance";

type Props = { user: AppUser | null };

export default function HeaderMenu({ user }: Props) {
  const { openDialog } = useAuthDialog();
  const { openPolicyDialog } = usePolicyDialog();
  const nextRouter = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const isLoggedIn = !!user;
  const isAuthor = user?.role === "AUTHOR";

  const ruri = useMemo(() => pathname ?? "/", [pathname]);
  const logoutUrl = `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/v1/auth/logout`;

  useEffect(() => {
    const isTypingElement = (el: EventTarget | null) => {
      return (
        el instanceof HTMLElement &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingElement(e.target)) return;
      if (e.shiftKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
        setOpen((prev) => !prev);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClearCache = async () => {
    try {
      await clearAllCacheAction();
      toast.success("서버 캐시가 완전히 초기화되었습니다.");
      setOpen(false);
    } catch (e) {
      console.error("Cache Clear Error:", e);
      toast.error("캐시 초기화 중 오류가 발생했습니다.");
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              ref={triggerRef}
              variant="ghost"
              className="inline-flex items-center justify-center rounded-full bg-transparent hover:bg-muted/60 transition ring-1 ring-transparent hover:ring-border backdrop-blur-sm gap-0 w-9 h-9 p-0 lg:w-auto lg:pl-1 lg:pr-3"
            >
              {user ? (
                <>
                  <Avatar className="h-9 w-9 border border-border/60 shrink-0">
                    <AvatarImage
                      src={user.avatarUrlSmall}
                      alt={user?.nickname ?? "Guest"}
                    />
                    <AvatarFallback className="text-[11px] font-semibold bg-background">
                      {user.nickname.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block pl-2 text-sm font-medium truncate max-w-32">
                    {user.nickname}
                  </span>
                </>
              ) : (
                <UserIcon className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center gap-2 text-xs">
            <span>메뉴</span>
            <div className="flex items-center gap-1">
              <Kbd>Shift</Kbd>
              <span>+</span>
              <Kbd>U</Kbd>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent
        className="bg-popover min-w-60 p-0 border-border/80"
        align="end"
        sideOffset={8}
      >
        {user ? (
          <HeaderUser user={user} />
        ) : (
          <HeaderGuest onLoginClick={openDialog} />
        )}

        <DropdownMenuSeparator />

        <DropdownMenuGroup className="px-1 py-1">
          <DropdownMenuItem
            onClick={() => nextRouter.push("/")}
            className="px-2.5"
          >
            <Home className="h-4 w-4 mr-2" />
            메인으로
          </DropdownMenuItem>

          {isAuthor && (
            <>
              <DropdownMenuItem
                onClick={() => nextRouter.push("/write")}
                className="px-2.5"
              >
                <PenSquare className="h-4 w-4 mr-2" />
                글작성
              </DropdownMenuItem>
            </>
          )}

          {isLoggedIn && (
            <DropdownMenuItem
              className="px-2.5"
              onClick={() =>
                window.open(
                  `https://github.com/${user.nickname}`,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              <SiGithub className="h-4 w-4 mr-2" />
              GitHub
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup className="px-1 py-1">
          <DropdownMenuItem
            onClick={() => nextRouter.push("/guest")}
            className="px-2.5"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            방명록
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={openPolicyDialog}
            className="px-2.5 cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4 mr-2" />
            개인정보 처리방침
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <HeaderAppearance />

        {isAuthor && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2.5 pt-2 pb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
              Management
            </div>
            <DropdownMenuGroup className="px-1 py-1">
              <DropdownMenuItem
                onClick={handleClearCache}
                className="px-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                전체 캐시 초기화
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}

        {isLoggedIn && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="px-1 py-1">
              <DropdownMenuItem asChild className="px-2.5">
                <form method="POST" action={logoutUrl} className="w-full">
                  <input type="hidden" name="ruri" value={ruri} />
                  <button
                    type="submit"
                    aria-label="로그아웃"
                    className="w-full text-left flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    로그아웃
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}

        <div className="flex items-center justify-end gap-1 px-3 py-2 border-t border-border/60 text-[11px] text-muted-foreground">
          <span>열기/닫기</span>
          <Kbd>Shift</Kbd>
          <span>+</span>
          <Kbd>U</Kbd>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
