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
  PenSquare,
  RefreshCw,
} from "lucide-react";
import { SiGithub } from "react-icons/si";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/shadcn/select";
import { CodeTheme, useCodeTheme } from "@/contexts/CodeThemeProvider";
import {
  PointColor,
  POINT_COLORS,
  usePointTheme,
} from "@/contexts/PointThemeProvider";
import { toast } from "sonner";
import { clearAllCacheAction } from "@/features/post/action/cacheAction";

type Props = { user: AppUser };

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

const CODE_THEME_OPTIONS: { value: CodeTheme; label: string }[] = [
  { value: "atom-one", label: "Atom One" },
  { value: "github", label: "GitHub" },
  { value: "stackoverflow", label: "StackOverflow" },
];

const POINT_OPTIONS: { value: PointColor; label: string }[] = [
  { value: "amber", label: "Amber" },
  { value: "sky", label: "Sky" },
  { value: "purple", label: "Purple" },
];

const UserDropdown = ({ user }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { codeTheme, setCodeTheme } = useCodeTheme();
  const { pointColor, setPointColor } = usePointTheme();

  // 컨트롤드 오픈 상태
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // 현재 페이지로 복귀용 ruri
  const ruri = useMemo(() => pathname ?? "/", [pathname]);

  const logoutUrl = `${process.env.NEXT_PUBLIC_API_DOMAIN}/api/v1/auth/logout`;
  const avatarUrl = `https://avatars.githubusercontent.com/u/${user.userId}?s=64`;
  const isAuthor = user.role === "AUTHOR";

  // Select value용 theme 정규화
  const currentThemeValue =
    theme === "light" || theme === "dark" || theme === "system"
      ? theme
      : "system";

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

        {/* Appearance */}
        <div className="px-2.5 pt-2 pb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
          Appearance
        </div>

        <div className="px-2.5 pb-2 space-y-2">
          {/* UI Theme */}
          <div>
            <div className="mb-1 text-[11px] text-muted-foreground">
              UI Theme
            </div>
            <Select
              value={currentThemeValue}
              onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}
            >
              <SelectTrigger
                className="h-8 w-full px-2 py-1 text-[11px] border-muted-foreground/30
                           bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
                aria-label="UI theme"
              >
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent align="end" className="text-xs min-w-[150px]">
                {THEME_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Code Theme */}
          <div>
            <div className="mb-1 text-[11px] text-muted-foreground">
              Code Theme
            </div>
            <Select
              value={codeTheme}
              onValueChange={(v) => setCodeTheme(v as CodeTheme)}
            >
              <SelectTrigger
                className="h-8 w-full px-2 py-1 text-[11px] border-muted-foreground/30
                           bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
                aria-label="Code highlight theme"
              >
                <SelectValue placeholder="Code theme" />
              </SelectTrigger>
              <SelectContent align="end" className="text-xs min-w-[150px]">
                {CODE_THEME_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Point Color */}
          <div>
            <div className="mb-1 text-[11px] text-muted-foreground">
              Point Color
            </div>
            <Select
              value={pointColor}
              onValueChange={(v) => {
                if (POINT_COLORS.includes(v as PointColor)) {
                  setPointColor(v as PointColor);
                }
              }}
            >
              <SelectTrigger
                className="h-8 w-full px-2 py-1 text-[11px] border-muted-foreground/30
                           bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
                aria-label="Point color"
              >
                <SelectValue placeholder="Point color" />
              </SelectTrigger>
              <SelectContent align="end" className="text-xs min-w-[150px]">
                {POINT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

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
