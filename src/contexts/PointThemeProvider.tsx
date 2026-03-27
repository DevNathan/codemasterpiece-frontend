"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useSyncExternalStore,
  ReactNode,
} from "react";
import { CookieManager } from "@/shared/module/cookieManager";
import { COOKIES } from "@/lib/constants/cookies";

/**
 * @file PointThemeProvider.tsx
 * @description 애플리케이션 전역의 포인트 컬러 테마를 관리하고 동기화하는 컨텍스트 프로바이더입니다.
 */

/** 포인트 테마에서 사용 가능한 색상 프리셋 상성입니다. */
export const POINT_COLORS = ["amber", "sky", "purple"] as const;
/** 포인트 컬러 타입 정의입니다. */
export type PointColor = (typeof POINT_COLORS)[number];

const ONE_YEAR = 60 * 60 * 24 * 365;
const DEFAULT_POINT: PointColor = "amber";

/** 컨텍스트가 제공하는 상태 및 제어 함수 인터페이스입니다. */
type PointThemeContextValue = {
  pointColor: PointColor;
  setPointColor: (color: PointColor) => void;
};

const PointThemeContext = createContext<PointThemeContextValue | null>(null);

/**
 * @component PointThemeProvider
 * @description
 * 포인트 컬러 테마를 제공하는 프로바이더 컴포넌트입니다.
 * * 최적화 전략:
 * 1. Hydration Mismatch 방지: useSyncExternalStore를 활용하여 서버와 클라이언트의 렌더링 결과가 일치하도록 관리합니다.
 * 2. Cascading Render 방지: useEffect 내부의 setState 호출을 제거하고, 렌더링 과정에서 값을 유도(Derived State)하여 불필요한 재렌더링을 차단합니다.
 */
export function PointThemeProvider({ children }: { children: ReactNode }) {
  /**
   * 클라이언트 환경 여부를 확인하기 위한 외부 스토어 동기화 훅입니다.
   * 서버 사이드 렌더링(SSR) 시에는 false를, 클라이언트 마운트 후에는 true를 반환하여
   * 하이드레이션 오류 없이 환경을 구분합니다.
   */
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  /** 사용자가 인터페이스를 통해 수동으로 변경한 테마를 임시 저장하는 상태입니다. */
  const [overridePointColor, setOverridePointColor] =
    useState<PointColor | null>(null);

  /**
   * 현재 활성화된 포인트 컬러를 결정합니다.
   * 렌더링 도중에 동기적으로 계산되어 리액트 19 컴파일러의 순수성 규칙을 준수합니다.
   */
  const pointColor = useMemo<PointColor>(() => {
    // 1. 사용자의 명시적 변경 사항이 있을 경우 이를 최우선으로 적용합니다.
    if (overridePointColor) return overridePointColor;

    // 2. 서버 환경이거나 마운트 전 단계에서는 기본값을 반환하여 Hydration 일관성을 유지합니다.
    if (!isClient) return DEFAULT_POINT;

    // 3. 클라이언트 환경에서는 쿠키에 저장된 테마 정보를 조회합니다.
    const fromCookie = CookieManager.getItem(COOKIES.POINT_THEME) as
      | PointColor
      | string
      | null;
    return POINT_COLORS.includes(fromCookie as PointColor)
      ? (fromCookie as PointColor)
      : DEFAULT_POINT;
  }, [isClient, overridePointColor]);

  /**
   * @function setPointColor
   * @description 새로운 포인트 컬러를 설정하고, 영구 저장을 위해 쿠키를 업데이트합니다.
   * @param {PointColor} color - 변경할 포인트 컬러 이름
   */
  const setPointColor = (color: PointColor) => {
    if (!POINT_COLORS.includes(color)) return;
    setOverridePointColor(color);
    CookieManager.setItem(COOKIES.POINT_THEME, color, { maxAgeSec: ONE_YEAR });
  };

  /**
   * 결정된 포인트 컬러를 문서 최상위 요소(html)의 클래스 리스트와 동기화합니다.
   * 이는 순수한 부수 효과(Side Effect)로서, 리액트 외부 시스템(DOM)을 업데이트합니다.
   */
  useEffect(() => {
    if (!isClient) return;

    const html = document.documentElement;
    // 이전 테마 클래스를 모두 제거한 후 현재 테마 클래스를 주입합니다.
    POINT_COLORS.forEach((c) => html.classList.remove(`point-${c}`));
    html.classList.add(`point-${pointColor}`);
  }, [pointColor, isClient]);

  return (
    <PointThemeContext.Provider value={{ pointColor, setPointColor }}>
      {children}
    </PointThemeContext.Provider>
  );
}

/**
 * @function usePointTheme
 * @description 포인트 테마 컨텍스트를 사용하기 위한 커스텀 훅입니다.
 * @throws {Error} PointThemeProvider 외부에서 호출될 경우 에러를 발생시킵니다.
 */
export function usePointTheme() {
  const ctx = useContext(PointThemeContext);
  if (!ctx) {
    throw new Error("usePointTheme must be used within PointThemeProvider");
  }
  return ctx;
}
