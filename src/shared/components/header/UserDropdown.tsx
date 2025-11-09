"use client";

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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/shadcn/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/shadcn/tooltip";
import { Kbd } from "@/shared/components/shadcn/kbd";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  Home,
  LayoutDashboard,
  LogOut,
  MonitorCog,
  Moon,
  PenSquare,
  Sun,
} from "lucide-react";
import { SiGithub } from "react-icons/si";

type Props = { user: AppUser };

const UserDropdown = ({ user }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme, theme, systemTheme } = useTheme();

  // 컨트롤드 오픈 상태
  const [open, setOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // 현재 페이지로 복귀용 ruri
  const ruri = useMemo(() => pathname ?? "/", [pathname]);

  const logoutUrl = `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/v1/auth/logout`;
  const avatarUrl = `https://avatars.githubusercontent.com/u/${user.userId}?s=64`;
  const isAuthor = user.role === "AUTHOR";

  // 단축키: Shift + U 로 메뉴 토글 (입력 중엔 무시)
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
        setOpen((prev) => !prev); // ← click 대신 상태 토글
        // 포커스 감각 살리기 (접근성 + 포커스링)
        triggerRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              ref={triggerRef}
              aria-label="User menu"
              className="inline-flex items-center gap-2 rounded-full pl-1 pr-2 py-1
                         bg-transparent hover:bg-muted/60 transition
                         ring-1 ring-transparent hover:ring-border
                         backdrop-blur-sm"
            >
              <Avatar className="size-8 sm:size-9 shadow-sm">
                <AvatarImage src={avatarUrl} alt={user.nickname} />
                <AvatarFallback className="text-[11px] font-semibold">
                  {user.nickname.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:inline text-sm font-medium truncate max-w-[120px]">
                {user.nickname}
              </span>
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center gap-2 text-xs">
            <span>유저 메뉴</span>
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
        {/* 헤더 */}
        <div className="px-3 pt-3 pb-2 flex items-center gap-3">
          <Avatar className="size-9 ring-1 ring-border/80 shadow-sm">
            <AvatarImage src={avatarUrl} alt={user.nickname} />
            <AvatarFallback className="text-[11px] font-semibold">
              {user.nickname.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">
              {user.nickname}
            </div>
            <div className="text-[11px] text-muted-foreground tracking-wide">
              {isAuthor ? "AUTHOR" : "READER"}
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* 퀵 액션 */}
        <DropdownMenuGroup className="px-1 py-1">
          <DropdownMenuItem onClick={() => router.push("/")} className="px-2.5">
            <Home className="h-4 w-4 mr-2" />
            메인으로
          </DropdownMenuItem>

          {isAuthor && (
            <>
              <DropdownMenuItem
                onClick={() => router.push("/write")}
                className="px-2.5"
              >
                <PenSquare className="h-4 w-4 mr-2" />
                글작성
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/dashboard")}
                className="px-2.5"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                관리페이지
              </DropdownMenuItem>
            </>
          )}

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
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* 테마 */}
        <div className="px-2.5 pt-2 pb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
          Appearance
        </div>
        <DropdownMenuGroup className="px-1 pb-1">
          <DropdownMenuItem
            onClick={() => setTheme("light")}
            className="px-2.5"
          >
            <Sun className="h-4 w-4 mr-2" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")} className="px-2.5">
            <Moon className="h-4 w-4 mr-2" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("system")}
            className="px-2.5"
          >
            <MonitorCog className="h-4 w-4 mr-2" />
            System
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* 로그아웃 */}
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

        {/* 풋터: 단축키 힌트 */}
        <div className="flex items-center justify-end gap-1 px-3 py-2 border-t border-border/60 text-[11px] text-muted-foreground">
          <span>열기</span>
          <Kbd>Shift</Kbd>
          <span>+</span>
          <Kbd>U</Kbd>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
