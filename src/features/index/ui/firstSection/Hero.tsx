"use client";

import Link from "next/link";
import { HeroTitle } from "@/features/index/ui/firstSection/HeroTitle";

export function Hero() {
  return (
    <div className="relative w-full flex-1 bg-gradient-to-br from-background via-background to-muted overflow-hidden">
      {/* === Section 1: Hero === */}
      <section className="min-h-[100dvh] w-full relative flex items-center justify-center">
        {/* 배경 라이트 */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)] pointer-events-none" />
        {/* 빛 번짐 */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl" />

        {/* 타이틀 */}
        <div className="relative z-10 text-center select-none px-4">
          <HeroTitle />

          <p className="mt-5 text-base sm:text-lg text-muted-foreground/90 font-medium tracking-wide animate-slide-up">
            웹에서 커널까지, 소프트웨어 프로그래밍 기술의 본질을 탐험하다.
          </p>

          <div className="mt-8 flex justify-center gap-4 animate-slide-up">
            <Link
              href="/posts"
              className="px-6 py-3 rounded-full font-semibold text-sm sm:text-base
                         bg-primary text-primary-foreground hover:bg-primary/90
                         transition-all duration-300 shadow-md hover:shadow-lg"
            >
              게시글 보기
            </Link>
            <Link
              href="/guest"
              className="px-6 py-3 rounded-full font-semibold text-sm sm:text-base
                         border border-border/70 text-foreground
                         hover:border-[hsl(var(--point))]
                         hover:text-[hsl(var(--point))]
                         transition-all duration-300"
            >
              방명록
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
