"use client";

import { useEffect, useMemo, useState } from "react";
import { useTyping } from "@/shared/hooks/useTyping";

type Phase = "idle" | "typing" | "hold" | "deleting";

type CycleOpts = {
  start: boolean;
  typeMs?: number;
  eraseMs?: number;
  holdMs?: number;
  gapMs?: number;
  delayMs?: number;
};

/**
 * useTypeCycle
 *
 * 여러 개의 문구를 순서대로 타이핑 → 유지 → 삭제하면서 순환시키는 커스텀 훅.
 * `useTyping` 훅을 내부적으로 사용해 정방향 타이핑을 처리하며, 역방향 삭제는 자체 구현으로 수행한다.
 *
 * 기본 흐름:
 * 1. start가 true가 되면 `typing` 단계로 진입하여 문구 출력
 * 2. 모든 문자를 출력하면 일정 시간(`holdMs`) 유지
 * 3. `deleting` 단계로 넘어가 역으로 문자를 한 글자씩 삭제
 * 4. 다음 문구로 인덱스 전환 후 다시 타이핑 시작
 *
 * 시스템 설정이 "모션 줄이기"로 되어 있을 경우,
 * 애니메이션 없이 문구만 일정 간격으로 순환한다.
 *
 * @param {string[]} phrases - 순환시킬 문자열 목록
 * @param {object} options - 애니메이션 설정 옵션
 * @param {boolean} options.start - true일 때 사이클 시작
 * @param {number} [options.typeMs=28] - 한 글자 타이핑 속도(ms)
 * @param {number} [options.eraseMs=14] - 한 글자 삭제 속도(ms)
 * @param {number} [options.holdMs=1200] - 한 문구 출력 후 유지 시간(ms)
 * @param {number} [options.gapMs=300] - 단계 전환 시 간격(ms)
 * @param {number} [options.delayMs=0] - 첫 타이핑 시작 전 지연 시간(ms)
 *
 * @returns {{ text: string, phase: Phase }}
 * - text: 현재 화면에 표시 중인 문자열
 * - phase: 현재 단계 ("idle" | "typing" | "hold" | "deleting")
 *
 * @example
 * const { text, phase } = useTypeCycle(
 *   ["CodeMasterpiece", "Design. Logic. Perfection."],
 *   { start: true, typeMs: 40, eraseMs: 20 }
 * );
 *
 * return <h1>{text}{phase === "typing" && "|"}</h1>;
 */
export function useTypeCycle(
  phrases: string[],
  {
    start,
    typeMs = 28,
    eraseMs = 14,
    holdMs = 1200,
    gapMs = 300,
    delayMs = 0,
  }: CycleOpts,
): { text: string; phase: Phase } {
  const [phase, setPhase] = useState<Phase>("idle");
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState("");
  const [kickTyping, setKickTyping] = useState(false);

  const current = useMemo(() => phrases[index] ?? "", [phrases, index]);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const { out, done } = useTyping(current, {
    start: kickTyping,
    speedMs: typeMs,
    delayMs,
  });

  useEffect(() => {
    if (phase === "typing") setDisplay(out);
  }, [out, phase]);

  useEffect(() => {
    if (!start || phase !== "idle") return;

    if (prefersReduced) {
      setDisplay(current);
      setPhase("hold");

      const t = window.setInterval(() => {
        setIndex((i) => {
          const next = (i + 1) % phrases.length;
          setDisplay(phrases[next] ?? "");
          return next;
        });
      }, holdMs + 600);

      return () => window.clearInterval(t);
    }

    setKickTyping(true);
    setPhase("typing");
  }, [start, phase, prefersReduced, phrases, current, holdMs]);

  useEffect(() => {
    if (phase !== "typing" || !done) return;
    const t = window.setTimeout(() => setPhase("hold"), holdMs);
    return () => window.clearTimeout(t);
  }, [phase, done, holdMs]);

  useEffect(() => {
    if (phase !== "hold") return;
    const t = window.setTimeout(() => setPhase("deleting"), gapMs);
    return () => window.clearTimeout(t);
  }, [phase, gapMs]);

  useEffect(() => {
    if (phase === "deleting") setKickTyping(false);
  }, [phase]);

  useEffect(() => {
    if (phase !== "deleting") return;

    let cancelled = false;

    const step = () => {
      if (cancelled) return;

      setDisplay((prev) => {
        if (prev.length <= 0) {
          setIndex((i) => {
            const next = (i + 1) % phrases.length;
            window.setTimeout(() => {
              if (!cancelled) {
                setKickTyping(true);
                setPhase("typing");
              }
            }, gapMs);
            return next;
          });
          return "";
        }
        window.setTimeout(step, eraseMs);
        return prev.slice(0, -1);
      });
    };

    const s = window.setTimeout(step, Math.max(eraseMs, 8));

    return () => {
      cancelled = true;
      window.clearTimeout(s);
    };
  }, [phase, eraseMs, gapMs, phrases.length]);

  return { text: display, phase };
}
