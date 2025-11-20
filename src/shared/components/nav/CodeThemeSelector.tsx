"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/shadcn/select";
import { CodeTheme, useCodeTheme } from "@/contexts/CodeThemeProvider";

const CODE_THEME_OPTIONS: { value: CodeTheme; label: string }[] = [
  { value: "atom-one", label: "Atom One" },
  { value: "github", label: "GitHub" },
  { value: "stackoverflow", label: "StackOverflow" },
];

type Props = { className?: string };

const CodeThemeSelector = ({ className }: Props) => {
  const { codeTheme, setCodeTheme } = useCodeTheme();

  return (
    <div className={cn("flex-1", className)}>
      <Select value={codeTheme} onValueChange={(v) => setCodeTheme(v as CodeTheme)}>
        <SelectTrigger
          className={cn(
            "h-8 w-full px-2 py-1 text-xs border-muted-foreground/30",
            "bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            "truncate"
          )}
          aria-label="Code highlight theme"
        >
          <SelectValue placeholder="Code theme" />
        </SelectTrigger>

        <SelectContent align="end" className="text-xs min-w-[120px]">
          {CODE_THEME_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CodeThemeSelector;
