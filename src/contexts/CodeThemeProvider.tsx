"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
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

export function CodeThemeProvider({ children }: { children: ReactNode }) {
  const [codeTheme, setCodeThemeState] = useState<CodeTheme>("github");

  // 초기값: LocalStorage → 없으면 github
  useEffect(() => {
    const stored = LocalStorage.getItem<CodeTheme>(LOCALS.CODE_THEME);
    const initial: CodeTheme =
      stored === "github" || stored === "stackoverflow"
        ? stored
        : "github";

    setCodeThemeState(initial);

    if (typeof document !== "undefined") {
      document.documentElement.dataset.codeTheme = initial;
    }
  }, []);

  // 변경 시: state + html data-attr + LocalStorage 동기화
  const setCodeTheme = (theme: CodeTheme) => {
    setCodeThemeState(theme);
    LocalStorage.setItem(LOCALS.CODE_THEME, theme);

    if (typeof document !== "undefined") {
      document.documentElement.dataset.codeTheme = theme;
    }
  };

  // state 변할 때마다 data-code-theme 보정 (안전장치)
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.codeTheme = codeTheme;
    }
  }, [codeTheme]);

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
