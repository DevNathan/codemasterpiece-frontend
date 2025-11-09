import React, { useRef } from "react";
import { useInView } from "framer-motion";
import { useTyping } from "@/shared/hooks/useTyping";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
};

const TypingTitle = ({ title }: Props) => {
  const titleRef = useRef<HTMLElement | null>(null);
  const inView = useInView(titleRef, {
    once: true,
    margin: "-20% 0px -10% 0px",
  });
  const { out, done } = useTyping(title, {
    start: inView,
    speedMs: 80,
    delayMs: 200,
  });

  return (
    <h1
      ref={titleRef as any}
      className="text-2xl md:text-4xl font-extrabold tracking-tight text-white"
      aria-label={title}
    >
      <span className="align-baseline">{out || (inView ? "" : title)}</span>
      <span
        aria-hidden="true"
        className={cn(
          "ml-1 inline-block h-[1em] w-[0.09em] align-baseline bg-white/90",
          done ? "opacity-0" : "animate-caret",
        )}
      />
    </h1>
  );
};

export default TypingTitle;
