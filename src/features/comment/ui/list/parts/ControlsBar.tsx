"use client";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = { left?: ReactNode; right?: ReactNode; className?: string };

export default function ControlsBar({ left, right, className }: Props) {
  return (
    <div className={cn("sticky top-0 z-10 -mx-3 px-3 py-2 backdrop-blur bg-background/70 border-b", className)}>
      <div className="flex items-center justify-between">{left}<div className="flex-1" />{right}</div>
    </div>
  );
}
