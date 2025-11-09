"use client";

import { MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  desc: string;
  className?: string;
};

export default function EmptyState({ title, desc, className }: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card/70 backdrop-blur",
        "px-6 py-12 text-center",
        className,
      )}
    >
      {/* subtle top glow */}
      <div className="absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-point/25 to-transparent" />
      {/* accent bar */}
      <div className="mx-auto mb-5 h-1 w-40 rounded-full bg-gradient-to-r from-point/20 via-point/70 to-point/20" />

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border bg-muted/60">
        <MessageSquarePlus
          className="h-5 w-5 text-muted-foreground"
          aria-hidden
        />
      </div>

      <h3 className="mt-4 text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
