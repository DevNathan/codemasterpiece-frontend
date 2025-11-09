"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/shared/assets/logo/Logo";
import { Button } from "@/shared/components/shadcn/button";
import { ArrowUp, Home, ShieldCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/shadcn/tooltip";
import ShareDialog from "@/shared/components/share/ShareDialog";
import PolicyDialog from "@/shared/components/footer/PolicyDialog";
import MyHoverCard from "@/shared/components/footer/MyHoverCard";

const SCROLL_THRESHOLD = 200;

const Footer = () => {
  const router = useRouter();
  const [policyOpen, setPolicyOpen] = useState(false);
  const [showToTop, setShowToTop] = useState(false);

  // 스크롤 위치에 따라 맨 위로 버튼 표시
  useEffect(() => {
    const onScroll = () => setShowToTop(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 맨 위로
  const handleToTop = () => {
    // 사용자 선호(감소된 모션) 존중
    const isReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: isReduced ? "auto" : "smooth" });
  };

  return (
    <footer
      className="
        relative w-full border-t border-border/70
        bg-sidebar/70 backdrop-blur-xl
        transition-colors duration-300
      "
      aria-label="사이트 푸터"
    >
      {/* 상단 그라데이션 라인 */}
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="mx-auto max-w-screen-xl px-4 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* 좌측: 로고/카피 */}
          <div className="space-y-2 text-center sm:text-left">
            <Link
              href="/"
              aria-label="홈으로"
              className="group inline-flex items-center justify-center gap-2 rounded-xl pr-2 hover:bg-primary/5 transition-colors"
            >
              <Logo />
              <p className="text-xl font-semibold tracking-tight">
                <span className="text-point">Code</span>{" "}
                <span className="group-hover:text-foreground/90 transition-colors">
                  Masterpiece
                </span>
              </p>
            </Link>

            <div className="text-xs text-muted-foreground leading-relaxed">
              <p className="opacity-90">All rights reserved.</p>
              <p>
                Coded by <MyHoverCard />
              </p>
              <p className="opacity-80">Released on Dec 1, 2024</p>
            </div>
          </div>

          {/* 우측: 액션 */}
          <div className="flex items-center justify-center gap-3">
            {/* 공유 */}
            <ShareDialog
              buttonVariant={"outline"}
              buttonAriaLabel={"공유"}
              buttonClassName={"size-9"}
            />

            {/* 정책 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  aria-label="정책"
                  onClick={() => setPolicyOpen(true)}
                  className="
                    size-9 rounded-full border-border/70
                    hover:border-primary/70 hover:bg-primary/5
                    transition-colors
                    focus-visible:ring-2 focus-visible:ring-primary
                  "
                >
                  <ShieldCheck className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>정책</TooltipContent>
            </Tooltip>

            {/* 홈 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="default"
                  aria-label="홈으로"
                  onClick={() => router.push("/")}
                  className="
                    size-9 rounded-full
                    shadow-sm hover:shadow
                    active:scale-[0.98]
                    transition-all
                    focus-visible:ring-2 focus-visible:ring-primary
                  "
                >
                  <Home className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>홈으로</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* 하단 라인 */}
        <div className="mt-6 border-t border-border/60 pt-4">
          <p className="text-[11px] text-muted-foreground text-center sm:text-right">
            Built with Next.js & shadcn/ui — stay sharp.
          </p>
        </div>
      </div>

      {/* 컨트롤드 정책 다이얼로그 */}
      <PolicyDialog
        open={policyOpen}
        onOpenChange={setPolicyOpen}
        autoOpenIfNotAck={true}
      />

      {/* 맨 위로 버튼 */}
      {showToTop && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              aria-label="맨 위로"
              onClick={handleToTop}
              className="
                fixed bottom-6 right-6 z-50
                size-11 rounded-full
                border-border/70
                bg-background/70 backdrop-blur-md
                hover:bg-primary/10 hover:border-primary/60
                active:scale-[0.97]
                transition-all
                shadow-sm hover:shadow
              "
            >
              <ArrowUp className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>맨 위로</TooltipContent>
        </Tooltip>
      )}
    </footer>
  );
};

export default Footer;
