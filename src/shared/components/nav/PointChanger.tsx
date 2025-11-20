"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/shadcn/dropdown-menu";
import { usePointTheme } from "@/contexts/PointThemeProvider";

const PointChanger = () => {
  const { pointColor, setPointColor } = usePointTheme();

  const itemBase =
    "flex items-center gap-2 cursor-pointer text-sm focus:bg-muted";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="포인트 색상 변경"
          className="size-8 bg-point rounded-full overflow-hidden p-0 relative border border-border/60"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setPointColor("amber")}
          className={itemBase}
        >
          <div className="w-8 h-8 rounded-full border border-muted bg-[hsl(42_94%_58%)]" />
          <p className="ml-2 text-xs">
            Amber {pointColor === "amber" ? "•" : ""}
          </p>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setPointColor("sky")}
          className={itemBase}
        >
          <div className="w-8 h-8 rounded-full border border-muted bg-[hsl(198_93%_60%)]" />
          <p className="ml-2 text-xs">
            Sky {pointColor === "sky" ? "•" : ""}
          </p>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setPointColor("purple")}
          className={itemBase}
        >
          <div className="w-8 h-8 rounded-full border border-muted bg-[hsl(262_83%_67%)]" />
          <p className="ml-2 text-xs">
            Purple {pointColor === "purple" ? "•" : ""}
          </p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PointChanger;
