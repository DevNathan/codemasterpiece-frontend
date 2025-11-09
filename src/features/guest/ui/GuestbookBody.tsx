"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { useGuestbook } from "@/features/guest/context/GuestbookContext";
import EntryForm from "@/features/guest/ui/EntryForm";
import EntryBubble from "@/features/guest/ui/EntryBubble";
import Intro from "@/features/guest/ui/Intro";
import { motion } from "framer-motion";
import { Flag } from "lucide-react";
import MessageBubbleSkeleton from "@/features/guest/ui/MessageBubbleSkeleton";

export default function GuestbookBody() {
  const { items, query, loadMore } = useGuestbook();
  const { isFetching, isFetchingNextPage, hasNextPage } = query;

  const ref = useRef<HTMLDivElement | null>(null);

  const onIntersect = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        await loadMore();
      }
    },
    [hasNextPage, isFetchingNextPage, loadMore],
  );

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(onIntersect, {
      root: null,
      rootMargin: "220px",
      threshold: 0,
    });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [onIntersect]);

  const skeletonAligns = useMemo<("left" | "right")[]>(
    () => ["left", "right", "left", "left", "right"],
    [],
  );

  return (
    <div className="relative mx-auto w-full max-w-[800px] px-6 pb-10">
      <Intro />

      {/* 입력 폼 카드 */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "border border-border/60 bg-background/70 backdrop-blur-xl",
          "shadow-[0_10px_40px_rgba(0,0,0,0.15)] ring-1 ring-black/5",
          "before:absolute before:inset-[-2px] before:-z-10 before:rounded-[20px]",
          "before:bg-[radial-gradient(110%_110%_at_0%_0%,theme(colors.point/22),transparent_55%)]",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[20px] after:ring-1 after:ring-white/5",
        )}
      >
        <EntryForm />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-point/60 to-transparent" />
      </div>

      {/* 리스트 */}
      <div className="mt-10 space-y-6">
        {items.map((entry) => (
          <EntryBubble key={entry.entryId} entry={entry} />
        ))}

        {(isFetching || isFetchingNextPage) &&
          skeletonAligns.map((align, i) => (
            <MessageBubbleSkeleton key={`skeleton-${i}`} align={align} />
          ))}

        {!hasNextPage && !isFetching && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mt-10 w-fit px-4 py-2 rounded-xl bg-accent text-accent-foreground border border-border shadow-sm flex items-center gap-2"
          >
            <Flag className="w-5 h-5 text-point" />
            <span className="text-sm font-medium">마지막 방명록입니다!</span>
          </motion.div>
        )}

        {/* 무한 스크롤 센티널 */}
        <div ref={ref} className="h-8" />
      </div>
    </div>
  );
}
