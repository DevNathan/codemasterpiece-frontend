"use client";

import { useEffect, useState } from "react";
import { useTypeCycle } from "@/shared/hooks/useTypeCycle";
import { cn } from "@/lib/utils";
import { Abril_Fatface } from "next/font/google";

const PHRASES = [
  "Code Masterpiece.",
  "Build. Break. Understand.",
  "No shortcuts. Only craft.",
];

const abril = Abril_Fatface({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export function HeroTitle() {
  const [start, setStart] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStart(true), 300); // 살짝 딜레이
    return () => clearTimeout(t);
  }, []);

  const { text, phase } = useTypeCycle(PHRASES, {
    start,
    typeMs: 50,
    eraseMs: 30,
    holdMs: 3000,
    gapMs: 220,
    delayMs: 0,
  });

  const caretHidden = phase === "hold";

  return (
    <h1
      className={cn(
        "text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight drop-shadow-[0_0_15px_rgba(0,0,0,0.25)] h-25",
        abril.className,
      )}
    >
      <span className="text-point-gradient tracking-normal">{text}</span>
      {/* 캐럿 */}
      <span
        aria-hidden
        className={cn(
          "ml-1 inline-block align-baseline h-[0.9em] w-[0.05em]",
          "bg-[hsl(var(--point))]",
          caretHidden ? "opacity-0" : "animate-pulse",
        )}
      />
      <span className="sr-only">Rotating title: {PHRASES.join(", ")}</span>
    </h1>
  );
}
