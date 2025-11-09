"use client";
import { useEffect, useRef, useState } from "react";

type Opt = IntersectionObserverInit & { once?: boolean };

export function useInViewOnce(opts?: Opt) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (opts?.once ?? true) observer.disconnect();
      }
    }, opts);

    observer.observe(el as Element);
    return () => observer.disconnect();
  }, [opts?.root, opts?.rootMargin, opts?.threshold, opts?.once]);

  return { ref, inView };
}
