"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/shadcn/card";
import { ScrollArea } from "@/shared/components/shadcn/scroll-area";
import { Button } from "@/shared/components/shadcn/button";
import { cn } from "@/lib/utils";
import { Link as LinkIcon, ListTree } from "lucide-react";
import { scrollToId } from "@/lib/scrollToId";
import { PostTocDTO } from "@/features/post/type/PostDetailDTO";
import { useNumberedTOC } from "@/features/post/hook/useNumberedTOC";

type Props = {
  headings: PostTocDTO[];
  activeId?: string;
  className?: string;
  title?: string;
  stickyOffset?: number;
};

export default function ArticleTOC({
  headings,
  activeId,
  className,
  title = "이 게시글에서는...",
  stickyOffset = 72,
}: Props) {
  const numbered = useNumberedTOC(headings);

  const onNavigate = React.useCallback(
    (id: string) => {
      scrollToId(id, stickyOffset);
    },
    [stickyOffset],
  );

  const onCopyLink = React.useCallback(async (id: string) => {
    const url = new URL(window.location.href);
    url.hash = id;
    await navigator.clipboard.writeText(url.toString());
  }, []);

  return (
    <aside
      className={cn(
        "w-full md:sticky md:top-(--toc-sticky-top,0px)",
        className,
      )}
      style={
        {
          ["--toc-sticky-top" as any]: `${stickyOffset}px`,
        } as React.CSSProperties
      }
      aria-label="Table of contents"
    >
      <Card className="border-muted/50 bg-card/90 backdrop-blur supports-backdrop-filter:bg-card/75 pt-0">
        <CardHeader className="py-4 px-4 border-b bg-linear-to-b from-background/60 to-transparent">
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
                      <span
                        aria-hidden
                        className={cn(
                          "ml-2 mr-2 h-5 w-0.75 rounded-full bg-border/70",
                          isActive && "bg-foreground/70",
                        )}
                      />
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
                        <span className="min-w-10 text-xs tabular-nums text-muted-foreground pt-0.5">
                          {h.label}.
                        </span>
                        <span className="flex-1">{h.text}</span>
                      </button>

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
