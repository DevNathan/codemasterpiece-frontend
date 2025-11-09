"use client";

import React from "react";
import { cn } from "@/lib/utils";

const ToGridIcon = ({
  toggle,
  className,
}: {
  toggle: boolean;
  className?: string;
}) => {
  const bg = toggle ? "fill-point" : "fill-muted";
  const cell = toggle ? "fill-primary-foreground" : "fill-muted-foreground";

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-6 w-6", "transition-all duration-300", className)}
    >
      {/* 배경 */}
      <rect
        width="24"
        height="24"
        rx="4"
        className={cn(bg, "transition-colors duration-300")}
      />

      {/* 내부 2x2 셀 */}
      <rect x="5" y="5" width="6" height="6" rx="1" className={cell} />
      <rect x="13" y="5" width="6" height="6" rx="1" className={cell} />
      <rect x="5" y="13" width="6" height="6" rx="1" className={cell} />
      <rect x="13" y="13" width="6" height="6" rx="1" className={cell} />
    </svg>
  );
};

export default ToGridIcon;
