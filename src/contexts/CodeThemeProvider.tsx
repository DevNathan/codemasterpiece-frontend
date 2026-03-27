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
import { LocalStorage } from "@/shared/module/localStorage";
import { LOCALS } from "@/lib/constants/localstorages";

export type CodeTheme = "atom-one" | "github" | "stackoverflow";

type CodeThemeContextValue = {
  codeTheme: CodeTheme;
  setCodeTheme: (theme: CodeTheme) => void;
};

const CodeThemeContext = createContext<CodeThemeContextValue | null>(null);

/**
 * @function CodeThemeProvider
 * @description 코드 하이라이팅 테마를 관리하는 프로바이더입니다.
 */
export function CodeThemeProvider({ children }: { children: ReactNode }) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [overrideTheme, setOverrideTheme] = useState<CodeTheme | null>(null);

  /**
   * 렌더링 도중 테마 결정 (Derived State)
   * 이펙트 안에서 setState를 하는 나약한 짓을 하지 않고, 렌더링 과정에서 즉시 값을 유도합니다.
   */
  const codeTheme = useMemo<CodeTheme>(() => {
    // 사용자가 직접 바꾼 테마가 있다면 최우선
    if (overrideTheme) return overrideTheme;
    // 서버 환경이거나 아직 마운트 전이면 무조건 기본값 (Hydration 일치 보장)
    if (!isClient) return "github";

    // 클라이언트 마운트 후라면 로컬 스토리지에서 즉시 로드
    const stored = LocalStorage.getItem<CodeTheme>(LOCALS.CODE_THEME);
    return stored === "github" ||
      stored === "stackoverflow" ||
      stored === "atom-one"
      ? stored
      : "github";
  }, [isClient, overrideTheme]);

  /**
   * @function setCodeTheme
   * @description 테마를 변경하고 로컬 스토리지에 영구 저장합니다.
   */
  const setCodeTheme = (theme: CodeTheme) => {
    setOverrideTheme(theme);
    LocalStorage.setItem(LOCALS.CODE_THEME, theme);
  };

  useEffect(() => {
    if (isClient) {
      document.documentElement.dataset.codeTheme = codeTheme;
    }
  }, [codeTheme, isClient]);

  return (
    <CodeThemeContext.Provider value={{ codeTheme, setCodeTheme }}>
      {children}
    </CodeThemeContext.Provider>
  );
}

export function useCodeTheme() {
  const ctx = useContext(CodeThemeContext);
  if (!ctx) {
    throw new Error("useCodeTheme must be used within CodeThemeProvider");
  }
  return ctx;
}
