"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/shadcn/select";
import { useTheme } from "next-themes";
import { CodeTheme, useCodeTheme } from "@/contexts/CodeThemeProvider";
import {
  POINT_COLORS,
  PointColor,
  usePointTheme,
} from "@/contexts/PointThemeProvider";

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

export default function HeaderAppearance() {
  const { theme, setTheme } = useTheme();
  const { codeTheme, setCodeTheme } = useCodeTheme();
  const { pointColor, setPointColor } = usePointTheme();

  const currentThemeValue =
    theme === "light" || theme === "dark" || theme === "system"
      ? theme
      : "system";

  return (
    <div className="px-2.5 pb-2 space-y-2">
      <div>
        <div className="mb-1 text-[11px] text-muted-foreground">UI Theme</div>
        <Select
          value={currentThemeValue}
          onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}
        >
          <SelectTrigger className="h-8 w-full px-2 py-1 text-[11px] border-muted-foreground/30 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent align="end" className="text-xs min-w-37.5">
            {THEME_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="mb-1 text-[11px] text-muted-foreground">Code Theme</div>
        <Select
          value={codeTheme}
          onValueChange={(v) => setCodeTheme(v as CodeTheme)}
        >
          <SelectTrigger className="h-8 w-full px-2 py-1 text-[11px] border-muted-foreground/30 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
            <SelectValue placeholder="Code theme" />
          </SelectTrigger>
          <SelectContent align="end" className="text-xs min-w-37.5">
            {CODE_THEME_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
          <SelectTrigger className="h-8 w-full px-2 py-1 text-[11px] border-muted-foreground/30 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
            <SelectValue placeholder="Point color" />
          </SelectTrigger>
          <SelectContent align="end" className="text-xs min-w-37.5">
            {POINT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
