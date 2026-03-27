"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/shared/components/shadcn/input";
import { Button } from "@/shared/components/shadcn/button";
import { Kbd } from "@/shared/components/shadcn/kbd";
import { cn } from "@/lib/utils";

/**
 * @component DesktopSearchBar
 * @description 데스크탑 환경에서 사용되는 전역 검색바 컴포넌트입니다.
 */
export function DesktopSearchBar() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!isClient) return;

    const k = new URLSearchParams(window.location.search).get("k") ?? "";
    if (!k) return;

    const timer = setTimeout(() => {
      setKeyword(k);
    }, 0);

    return () => clearTimeout(timer);
  }, [isClient]);

  /**
   * 전역 단축키(Ctrl+K)를 감지하여 검색창에 포커스를 줍니다.
   */
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
        "focus-within:ring-2 focus-within:ring-point",
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

      <div className="col-start-2 col-end-3 w-18 flex items-center justify-end pr-2 text-xs text-muted-foreground">
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
