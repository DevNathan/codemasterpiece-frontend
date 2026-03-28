"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import Logo from "@/shared/assets/logo/Logo";
import { SidebarTrigger } from "@/shared/components/shadcn/sidebar";
import { Button } from "@/shared/components/shadcn/button";
import { Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/shadcn/tooltip";
import { Kbd } from "@/shared/components/shadcn/kbd";
import { DesktopSearchBar } from "@/shared/components/header/DesktopSearchBar";
import MobileSearch from "@/shared/components/header/MobileSearch";
import { useAuth } from "@/contexts/UserContext";
import HeaderMenu from "@/shared/components/header/HeaderMenu";

export function Header() {
  // 모바일 검색 모달
  const { user } = useAuth();
  const [openSearch, setOpenSearch] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-12 md:h-14 bg-sidebar/95 backdrop-blur border-b border-border pt-[env(safe-area-inset-top)] transition-colors duration-500 root-header">
      <div className="mx-auto w-full h-full px-4 flex items-center justify-between gap-3">
        {/* 좌측 공통: 메뉴 */}
        <div className="flex items-center gap-3">
          {/* 사이드바 트리거 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger
                type="button"
                variant="outline"
                size="sm"
                aria-label="메뉴"
                className="rounded-full"
              />
            </TooltipTrigger>
            <TooltipContent className="hidden md:block">
              <div className="flex items-center gap-1">
                <span>메뉴</span>
                <Kbd>Ctrl</Kbd>
                <span>+</span>
                <Kbd>B</Kbd>
              </div>
            </TooltipContent>
          </Tooltip>

          {/* 데스크톱 로고(모바일에선 중앙 고정 로고 사용) */}
          <Link
            href="/"
            aria-label="홈으로"
            className="hidden md:flex items-center rounded-full"
          >
            <Logo />
            <p className="text-xl sm:text-2xl font-semibold whitespace-nowrap mx-2">
              <span className="text-point transition-colors duration-500">
                Code
              </span>{" "}
              Masterpiece
            </p>
          </Link>
        </div>

        {/* 데스크톱: 중앙 검색바 */}
        <div className="hidden md:flex flex-1 justify-center">
          <DesktopSearchBar />
        </div>

        {/* 모바일: 중앙 로고(항상 화면 정중앙) */}
        <Link
          href="/"
          aria-label="홈"
          className="md:hidden absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
        >
          <Logo />
        </Link>

        {/* 우측 액션 */}
        <div className="flex items-center gap-1 md:gap-3 ml-auto">
          {/* 모바일: 검색 버튼 */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="검색 열기"
            onClick={() => setOpenSearch(true)}
            className="h-9 w-9 md:hidden"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* 메뉴 */}
          <Suspense
            fallback={
              <div
                aria-hidden
                className="h-9 w-9 rounded-full bg-muted/70 border border-border/60 animate-pulse"
              />
            }
          >
            <HeaderMenu user={user} />
          </Suspense>
        </div>
      </div>

      <MobileSearch open={openSearch} onOpenChange={setOpenSearch} />
    </header>
  );
}
