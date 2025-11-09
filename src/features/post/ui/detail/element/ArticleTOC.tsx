"use client";

import * as React from "react";
import type { HeadingMeta } from "@/shared/components/markdown/HeadingContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/shadcn/card";
import { ScrollArea } from "@/shared/components/shadcn/scroll-area";
import { Button } from "@/shared/components/shadcn/button";
import { cn } from "@/lib/utils";
import { Link as LinkIcon, ListTree } from "lucide-react";
import { scrollToId } from "@/lib/scrollToId";

type Props = {
  headings: HeadingMeta[];
  activeId?: string;
  className?: string;
  title?: string;
  stickyOffset?: number;
};

export default function ArticleTOC({
  headings,
  activeId,
  className,
  title = "이 페이지에서는...",
  stickyOffset = 72,
}: Props) {
  if (!headings?.length) return null;

  // 계층 넘버링 생성 (1, 1.1, 1.1.1 …)
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

  const onNavigate = React.useCallback((id: string) => {
    scrollToId(id, stickyOffset);
  }, []);

  const onCopyLink = React.useCallback(async (id: string) => {
    const url = new URL(window.location.href);
    url.hash = id;
    await navigator.clipboard.writeText(url.toString());
  }, []);

  return (
    <aside
      className={cn(
        "w-full md:sticky md:top-[var(--toc-sticky-top,0px)]",
        className,
      )}
      style={
        {
          ["--toc-sticky-top" as any]: `${stickyOffset}px`,
        } as React.CSSProperties
      }
      aria-label="Table of contents"
    >
      <Card className="border-muted/50 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <CardHeader className="py-3 px-4 border-b bg-gradient-to-b from-background/60 to-transparent">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              {title}
            </CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ListTree className="size-4" />
              <span className="text-xs tabular-nums">{headings.length}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-80 md:max-h-[60vh]">
            <ul className="p-2 pr-2">
              {numbered.map((h) => {
                const isActive = activeId === h.id;
                const depthClass =
                  h.depth === 1
                    ? "pl-0"
                    : h.depth === 2
                      ? "pl-2"
                      : h.depth === 3
                        ? "pl-4"
                        : "pl-6";
                return (
                  <li key={`${h.depth}-${h.id}`} className="group">
                    <div
                      className={cn(
                        "flex items-center rounded-md",
                        "hover:bg-muted/60 transition-colors",
                        isActive && "bg-muted/60 ring-1 ring-border",
                      )}
                    >
                      {/* 좌측 depth 인디케이터 */}
                      <span
                        aria-hidden
                        className={cn(
                          "ml-2 mr-2 h-5 w-[3px] rounded-full bg-border/70",
                          isActive && "bg-foreground/70",
                        )}
                      />
                      {/* 번호 + 텍스트 */}
                      <button
                        type="button"
                        onClick={() => onNavigate(h.id)}
                        className={cn(
                          "flex-1 text-left text-sm py-1 pr-2 flex items-start gap-2",
                          depthClass,
                          h.depth === 1 && "font-semibold",
                          h.depth >= 4 && "text-muted-foreground",
                        )}
                      >
                        <span className="min-w-[2.5rem] text-xs tabular-nums text-muted-foreground pt-0.5">
                          {h.label}.
                        </span>
                        <span className="flex-1">{h.text}</span>
                      </button>

                      {/* 링크 복사 */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Copy link to ${h.text}`}
                        className="h-7 w-7 mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onCopyLink(h.id)}
                      >
                        <LinkIcon className="size-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </aside>
  );
}
