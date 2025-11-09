"use client";

import React from "react";
import type { HeadingMeta } from "@/shared/components/markdown/HeadingContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/shared/components/shadcn/dropdown-menu";
import { Button } from "@/shared/components/shadcn/button";
import { ScrollArea } from "@/shared/components/shadcn/scroll-area";
import { ListTree } from "lucide-react";
import { cn } from "@/lib/utils";
import { scrollToId } from "@/lib/scrollToId";

type Props = {
  headings: HeadingMeta[];
  className?: string;
};

export default function MobileTOC({ headings, className }: Props) {
  if (!headings?.length) return null;

  // 번호 생성 로직 (1, 1.1, 1.2.1 …)
  const numbered = React.useMemo(() => {
    const counters = [0, 0, 0, 0, 0, 0];
    return headings.map((h) => {
      const d = Math.min(Math.max(h.depth, 1), 6);
      counters[d - 1] += 1;
      for (let i = d; i < 6; i++) counters[i] = 0;
      const label = counters.slice(0, d).filter(Boolean).join(".");
      return { ...h, label };
    });
  }, [headings]);

  const jump = (id: string) => {
    scrollToId(id, 72);
  };

  return (
    <div
      className={cn(
        "lg:hidden fixed top-20 right-3 z-50",
        className
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full shadow-md cursor-pointer"
            aria-label="Open table of contents"
          >
            <ListTree className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-72 p-0"
        >
          <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            On this page
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <ScrollArea className="max-h-[65vh]">
            <ul className="py-1">
              {numbered.map((h) => {
                const depthClass =
                  h.depth === 1
                    ? "pl-2 font-semibold"
                    : h.depth === 2
                      ? "pl-4"
                      : h.depth === 3
                        ? "pl-6"
                        : "pl-8 text-muted-foreground";
                return (
                  <li key={`${h.depth}-${h.id}`}>
                    <DropdownMenuItem
                      onClick={() => jump(h.id)}
                      className={cn(
                        "cursor-pointer text-sm flex items-start gap-2",
                        depthClass
                      )}
                    >
                      <span className="min-w-[2rem] text-xs tabular-nums text-muted-foreground pt-0.5">
                        {h.label}.
                      </span>
                      <span className="flex-1">{h.text}</span>
                    </DropdownMenuItem>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
