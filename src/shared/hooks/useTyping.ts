"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/**
 * useTyping
 *
 * 주어진 문자열을 한 글자씩 출력하는 타이핑 효과용 커스텀 훅.
 * `start`가 true가 되면 애니메이션을 시작하며,
 * 지정된 속도와 지연 시간에 따라 순차적으로 텍스트를 렌더링한다.
 *
 * 사용자의 시스템 설정이 "모션 줄이기"일 경우
 * 애니메이션 없이 전체 문자열을 즉시 출력한다.
 *
 * @param {string} text - 출력할 문자열
 * @param {object} options - 옵션 객체
 * @param {boolean} options.start - true일 때 타이핑 시작
 * @param {number} [options.speedMs=24] - 글자 간 출력 간격(ms)
 * @param {number} [options.delayMs=0] - 타이핑 시작 전 지연(ms)
 *
 * @returns {{ out: string, done: boolean }}
 * out: 현재까지 출력된 문자열
 * done: 타이핑이 완료되면 true
 *
 * @example
 * const { out, done } = useTyping("Hello", { start: true, speedMs: 30 });
 * return <p>{out}{!done && "|"}</p>;
 */
export function useTyping(
  text: string,
  {
    start,
    speedMs = 24,
    delayMs = 0,
  }: {
    start: boolean;
    speedMs?: number;
    delayMs?: number;
  },
): { out: string; done: boolean } {
  const prefersReduced = useSyncExternalStore(
    useCallback((callback: () => void) => {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      mediaQuery.addEventListener("change", callback);
      return () => mediaQuery.removeEventListener("change", callback);
    }, []),
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false, // 서버 사이드 기본값
  );

  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);

  // 이전 인자값을 추적하여 상태 동기화(Reset) 여부를 판단합니다.
  const [prevArgs, setPrevArgs] = useState({ text, start });

  const idxRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const startTimerRef = useRef<number | null>(null);

  if (text !== prevArgs.text || start !== prevArgs.start) {
    setPrevArgs({ text, start });

    if (prefersReduced && start) {
      setOut(text);
      setDone(true);
    } else {
      setOut("");
      setDone(false);
    }
  }

  useEffect(() => {
    idxRef.current = 0;

    if (!start || prefersReduced) return;

    const tick = () => {
      const i = idxRef.current;
      if (i >= text.length) {
        setDone(true);
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = null;
        return;
      }
      setOut((prev) => prev + text.charAt(i));
      idxRef.current = i + 1;
      timerRef.current = window.setTimeout(tick, speedMs);
    };

    startTimerRef.current = window.setTimeout(tick, delayMs);

    return () => {
      if (startTimerRef.current) window.clearTimeout(startTimerRef.current);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [start, text, speedMs, delayMs, prefersReduced]);

  return { out, done };
}
