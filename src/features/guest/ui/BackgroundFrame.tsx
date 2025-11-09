"use client";

import type { ReactNode } from "react";

/**
 * 페이지 전체 배경을 꾸며주는 프레임
 * - 오로라처럼 번지는 그라데이션 조명
 * - 부드러운 그레인 텍스처
 * - 스크롤해도 콘텐츠에만 집중 가능
 */
export default function BackgroundFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-background text-foreground">
      {/* 오로라 그라데이션 */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* 메인 딥톤 배경 */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        {/* 좌상단 포인트 */}
        <div className="absolute -top-32 -left-40 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--point))/18_0%,transparent_70%)] blur-3xl opacity-80" />
      </div>

      {/* 콘텐츠 */}
      <main className="relative z-10">{children}</main>
    </div>
  );
}
