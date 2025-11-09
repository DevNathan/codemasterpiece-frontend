"use client";

import React from "react";
import { cn } from "@/lib/utils";

const ToListIcon = ({
  toggle,
  className,
}: {
  toggle: boolean;
  className?: string;
}) => {
  // 활성: point 배경, 라인/불릿은 대비색
  const bg = toggle ? "fill-point" : "fill-muted";
  const fg = toggle ? "fill-primary-foreground" : "fill-muted-foreground";

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-6 w-6 transition-all duration-300", className)}
    >
      {/* 배경 */}
      <rect
        width="24"
        height="24"
        rx="4"
        className={cn(bg, "transition-colors duration-300")}
      />

      {/* 불릿 + 라인 3세트 (가독성 좋은 패딩/라운드) */}
      {/* Row 1 */}
      <rect x="4.25" y="4.25" width="4.5" height="4.5" rx="1" className={fg} />
      <rect x="10.5" y="5" width="9.5" height="3" rx="1.25" className={fg} />

      {/* Row 2 */}
      <rect x="4.25" y="9.75" width="4.5" height="4.5" rx="1" className={fg} />
      <rect x="10.5" y="10.5" width="9.5" height="3" rx="1.25" className={fg} />

      {/* Row 3 */}
      <rect x="4.25" y="15.25" width="4.5" height="4.5" rx="1" className={fg} />
      <rect x="10.5" y="16" width="9.5" height="3" rx="1.25" className={fg} />
    </svg>
  );
};

export default ToListIcon;
