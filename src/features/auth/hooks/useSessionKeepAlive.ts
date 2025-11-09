"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import sessionTouch from "@/features/auth/api/sessionTouch";
import { isSuccess } from "@/lib/api/clientFetch";

/**
 * 옵션 for {@link useSessionKeepAlive}
 * @remarks
 * - 모든 시간 단위는 밀리초(ms).
 * - 값이 주어지지 않으면 각 필드의 `@default`가 적용됩니다.
 */
type KeepAliveOptions = {
  /**
   * 세션 연장(ping) 엔드포인트
   * @default "/api/v1/auth/ping"
   */
  pingUrl?: string;

  /**
   * 하트비트 주기. 이 주기마다 ping 시도
   * @default 5 * 60 * 1000 (5분)
   */
  heartbeatMs?: number;

  /**
   * 최근 활동 허용 윈도우. 초과 시 하트비트 skip
   * @default 3 * 60 * 1000 (3분)
   */
  activeWindowMs?: number;

  /**
   * 마지막 성공 핑 이후 경과가 이 시간을 넘으면 경고(warn) 전환
   * @default 50 * 60 * 1000 (50분)
   */
  warnAfterMs?: number;

  /**
   * 마지막 성공 핑 이후 경과가 이 시간을 넘으면 강제 만료(hardExpired) 전환
   * @default 60 * 60 * 1000 (60분)
   */
  hardExpireMs?: number;

  /**
   * 서버가 남은 시간을 제공하지 않을 때 ETA 계산의 기준 TTL
   * @default 60 * 60 * 1000 (60분)
   */
  assumedTtlMs?: number;

  /**
   * 경고 상태로 전환 시 호출(모달/토스트 오픈 등)
   */
  onWarnOpenAction?: () => void;

  /**
   * 경고 상태 해제 시 호출(모달/토스트 닫기 등)
   */
  onWarnCloseAction?: () => void;
};

/**
 * 세션 상태 객체
 */
export type SessionState = {
  /**
   * 경고 상태 여부(세션 만료 임박)
   */
  warn: boolean;

  /**
   * 남은 시간(추정, ms). 서버 제공값 없을 때 {@link KeepAliveOptions.assumedTtlMs} 기반 계산
   */
  etaMs: number;

  /**
   * 마지막 성공 핑 시각(epoch ms). 마운트 이후 최초로 설정됨
   */
  lastOkAt: number | null;

  /**
   * 강제 만료 상태 여부(실질적으로 세션 실효로 간주)
   */
  hardExpired: boolean;
};

/**
 * 사용자 활동 기반 세션 자동 연장 훅
 *
 * 브라우저 이벤트를 감지하고 주기적으로 서버에 ping을 보내
 * 세션 만료를 방지합니다. 경고/만료 UI 트리거 지원.
 *
 * @param opts - {@link KeepAliveOptions}
 * @returns 훅 결과 객체
 * @returns returns.state - 현재 세션 상태 {@link SessionState}
 * @returns returns.actions - 수동 트리거 함수 집합
 * @returns returns.actions.beat - 즉시 하트비트 실행
 * @returns returns.actions.markActivity - 사용자 활동 수동 마킹
 *
 * @example
 * ```tsx
 * const { state, actions } = useSessionKeepAlive({
 *   onWarnOpenAction: () => setOpen(true),
 *   onWarnCloseAction: () => setOpen(false),
 *   heartbeatMs: 120_000, // 2분
 * });
 *
 * useEffect(() => {
 *   if (state.hardExpired) {
 *     router.replace("/login?expired=1");
 *   }
 * }, [state.hardExpired]);
 *
 * // 버튼으로 수동 연장
 * <Button onClick={actions.beat}>연장</Button>
 * ```
 *
 * @remarks
 * - SSR/프리렌더 결정성을 위해 **현재 시각은 마운트 이후(useEffect)에서만** 읽습니다.
 * - 백그라운드 탭(`document.hidden === true`)이거나 최근 활동이 없으면 네트워크 왕복을 줄이기 위해 ping을 생략합니다.
 * - 서버가 `expMs`(남은 시간)를 내려주면 이를 우선 사용합니다.
 * - 경고 전환/해제 시 콜백을 통해 모달/토스트를 제어할 수 있습니다.
 * - 강제 만료(`hardExpired=true`)가 되면 상위 레벨에서 재로그인 유도/라우팅 처리하세요.
 *
 * @since 1.0.0
 */
export function useSessionKeepAlive(opts: KeepAliveOptions = {}) {
  const {
    pingUrl = "/api/v1/auth/ping",
    heartbeatMs = 5 * 60 * 1000,
    activeWindowMs = 3 * 60 * 1000,
    warnAfterMs = 50 * 60 * 1000,
    hardExpireMs = 60 * 60 * 1000,
    assumedTtlMs = 60 * 60 * 1000,
    onWarnOpenAction,
    onWarnCloseAction,
  } = opts;

  // 렌더 단계에서는 비결정 값 사용 금지 → 초기값은 결정적 상수만 사용
  const [state, setState] = useState<SessionState>({
    warn: false,
    etaMs: assumedTtlMs,
    lastOkAt: null,
    hardExpired: false,
  });

  // 마지막 사용자 활동 시각(마운트 후에 현재 시각으로 설정)
  const lastActivityAt = useRef<number>(0);

  // 타이머 핸들
  const hbTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // 강제 만료 처리 플래그(중복 처리 방지 등 외부 제어 고리로 확장 가능)
  const closing = useRef(false);

  // ----- 마운트 이후 현재 시각 주입(SSR/프리렌더 안전성 확보) ----- //
  useEffect(() => {
    const now = Date.now();
    lastActivityAt.current = now;
    setState((s) => ({ ...s, lastOkAt: now }));
  }, []);

  // ----- 사용자 활동 마킹(수동/자동) ----- //
  /**
   * 사용자 활동을 수동으로 기록
   * @example
   * ```ts
   * actions.markActivity(); // 커스텀 인풋/드래그 등과 연계
   * ```
   */
  const markActivity = useCallback(() => {
    lastActivityAt.current = Date.now();
  }, []);

  // 기본 활동 이벤트 바인딩
  useEffect(() => {
    const evts = [
      "keydown",
      "pointerdown",
      "scroll",
      "wheel",
      "touchstart",
      "input",
    ] as const;
    evts.forEach((e) =>
      window.addEventListener(e, markActivity, { passive: true }),
    );
    return () => {
      evts.forEach((e) => window.removeEventListener(e, markActivity));
    };
  }, [markActivity]);

  // ----- 하트비트(ping) 로직 ----- //
  /**
   * 즉시 하트비트를 실행하여 세션을 연장 시도합니다.
   * 백그라운드 탭이거나 최근 활동이 없으면 네트워크 호출을 생략합니다.
   */
  const beat = useCallback(async () => {
    // 백그라운드 탭이면 서버 호출 생략
    if (document.hidden) return;

    // 최근 활동이 없으면 서버 호출 생략(불필요한 네트워크 절감)
    const now = Date.now();
    if (now - lastActivityAt.current > activeWindowMs) return;

    try {
      const res = await sessionTouch(pingUrl);

      // 인증 상실(401/419 등) → 경고 상태로 전환
      if (!isSuccess(res)) {
        setState((s) => ({ ...s, warn: true }));
        onWarnOpenAction?.();
        return;
      }

      // 서버가 expMs(남은 시간)를 제공하면 우선 사용
      const expMs =
        typeof (res as any)?.data?.expMs === "number"
          ? (res as any).data.expMs
          : undefined;

      setState((s) => {
        const baseLast = s.lastOkAt ?? now;
        const ttl = Math.max(assumedTtlMs - (now - baseLast), 0);
        const next: SessionState = {
          ...s,
          lastOkAt: now,
          warn: false,
          etaMs: typeof expMs === "number" ? expMs : ttl,
          hardExpired: false,
        };
        if (s.warn) onWarnCloseAction?.(); // 기존 경고 상태였다면 닫기 콜백 호출
        return next;
      });
    } catch {
      // 네트워크 오류 등 일시 장애는 여기서 상태를 강제하지 않음
      // 실제 경고/만료 판단은 아래 "틱" 루프에서 수행
    }
  }, [
    pingUrl,
    activeWindowMs,
    assumedTtlMs,
    onWarnOpenAction,
    onWarnCloseAction,
  ]);

  // 하트비트 타이머 등록/해제
  useEffect(() => {
    hbTimer.current = setInterval(beat, heartbeatMs);
    return () => {
      if (hbTimer.current) clearInterval(hbTimer.current);
    };
  }, [beat, heartbeatMs]);

  // ----- 경고/만료 판단 틱(초당 1회) ----- //
  useEffect(() => {
    tickTimer.current = setInterval(() => {
      setState((s) => {
        const now = Date.now();
        const last = s.lastOkAt ?? now; // 아직 lastOkAt이 없다면 경과 0으로 처리
        const since = now - last;

        const nextWarn = since >= warnAfterMs && !s.hardExpired;
        const nextHard = since >= hardExpireMs;

        // 경고 상태 전환/해제 콜백
        if (nextWarn && !s.warn) onWarnOpenAction?.();
        if (!nextWarn && s.warn) onWarnCloseAction?.();

        // 강제 만료 최초 진입 시 한번만 플래그(추후 라우팅/로그아웃 등의 트리거에 사용)
        if (nextHard && !closing.current) {
          closing.current = true;
        }

        return {
          ...s,
          warn: nextWarn || s.warn,
          hardExpired: nextHard || s.hardExpired,
          etaMs: Math.max(assumedTtlMs - since, 0),
        };
      });
    }, 1000);

    return () => {
      if (tickTimer.current) clearInterval(tickTimer.current);
    };
  }, [
    warnAfterMs,
    hardExpireMs,
    assumedTtlMs,
    onWarnOpenAction,
    onWarnCloseAction,
  ]);

  return {
    state,
    actions: {
      beat,
      markActivity,
    },
  };
}
