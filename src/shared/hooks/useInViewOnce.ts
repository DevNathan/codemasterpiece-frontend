"use client";
import { useEffect, useRef, useState } from "react";

type Opt = IntersectionObserverInit & { once?: boolean };

/**
 * 요소가 화면에 교차되는지 관찰하는 커스텀 훅입니다.
 * 한 번 감지된 후 관찰을 중단하는 기능을 지원하며, React Compiler의 의존성 규칙을 준수합니다.
 */
export function useInViewOnce(opts?: Opt) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  const root = opts?.root;
  const rootMargin = opts?.rootMargin;
  const threshold = opts?.threshold;
  const once = opts?.once ?? true;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 추출된 속성들을 바탕으로 Observer를 초기화하여 의존성 불일치를 해결합니다.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        }
      },
      { root, rootMargin, threshold },
    );

    observer.observe(el as Element);
    return () => observer.disconnect();
  }, [root, rootMargin, threshold, once]);

  return { ref, inView };
}
