"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/shared/components/shadcn/input";
import { Button } from "@/shared/components/shadcn/button";
import { Kbd } from "@/shared/components/shadcn/kbd";
import { cn } from "@/lib/utils";

export function DesktopSearchBar() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // URL의 ?k= 를 마운트 후에만 읽어 초기화 (SSR 결정성 보존)
  useEffect(() => {
    const k = new URLSearchParams(window.location.search).get("k") ?? "";
    setKeyword(k);
  }, []);

  // Ctrl+K 포커스
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const go = () => {
    const q = keyword.trim();
    if (!q) return;
    router.push(`/posts?k=${encodeURIComponent(q)}`);
  };

  return (
    <div
      className={cn(
        "relative mx-2 w-full max-w-xl",
        "grid grid-cols-[1fr_auto_auto] items-center",
        "h-10 rounded-full border bg-muted/60 shadow transition-all",
        "focus-within:ring-2 focus-within:ring-[hsl(var(--point))]",
      )}
    >
      <Input
        ref={inputRef}
        value={keyword}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") go();
          if (e.key === "Escape") inputRef.current?.blur();
        }}
        placeholder="검색"
        className="col-start-1 col-end-2 h-full rounded-l-full rounded-r-none border-none bg-transparent px-4 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
        aria-label="검색어 입력"
      />

      <div className="col-start-2 col-end-3 w-[72px] flex items-center justify-end pr-2 text-xs text-muted-foreground">
        {!focused && (
          <div className="flex items-center gap-0.5">
            <Kbd className="bg-foreground text-background">Ctrl</Kbd>
            <span>+</span>
            <Kbd className="bg-foreground text-background">K</Kbd>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="col-start-3 col-end-4 w-10 h-10 rounded-full"
        aria-label="검색"
        onClick={go}
      >
        <Search className="w-4 h-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
