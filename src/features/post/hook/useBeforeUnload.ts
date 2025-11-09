"use client";

import { useEffect } from "react";

/**
 * 페이지 이탈(새로고침/닫기/주소창 이동) 경고 훅
 * enabled=true 일 때만 브라우저 기본 경고를 띄운다.
 */
export const useBeforeUnloadGuard = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: BeforeUnloadEvent) => {
      // 크롬 등 최신 브라우저에서 경고창을 띄우려면 반드시 returnValue 지정 필요
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [enabled]);
};
