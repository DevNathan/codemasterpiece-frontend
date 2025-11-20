"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { CookieManager } from "@/shared/module/cookieManager";
import { COOKIES } from "@/lib/constants/cookies";

export const POINT_COLORS = ["amber", "sky", "purple"] as const;
export type PointColor = (typeof POINT_COLORS)[number];

const ONE_YEAR = 60 * 60 * 24 * 365;
const DEFAULT_POINT: PointColor = "amber";

type PointThemeContextValue = {
  pointColor: PointColor;
  setPointColor: (color: PointColor) => void;
};

const PointThemeContext = createContext<PointThemeContextValue | null>(null);

export function PointThemeProvider({ children }: { children: ReactNode }) {
  const [pointColor, setPointColorState] = useState<PointColor>(DEFAULT_POINT);

  // 초기값: 쿠키 → 없으면 DEFAULT
  useEffect(() => {
    if (typeof document === "undefined") return;

    const fromCookie = CookieManager.getItem(COOKIES.POINT_THEME) as
      | PointColor
      | string
      | null;

    const initial: PointColor = POINT_COLORS.includes(fromCookie as PointColor)
      ? (fromCookie as PointColor)
      : DEFAULT_POINT;

    setPointColorState(initial);

    const html = document.documentElement;
    POINT_COLORS.forEach((c) => html.classList.remove(`point-${c}`));
    html.classList.add(`point-${initial}`);
  }, []);

  const setPointColor = (color: PointColor) => {
    if (!POINT_COLORS.includes(color)) return;

    setPointColorState(color);

    if (typeof document !== "undefined") {
      const html = document.documentElement;
      POINT_COLORS.forEach((c) => html.classList.remove(`point-${c}`));
      html.classList.add(`point-${color}`);
    }

    CookieManager.setItem(COOKIES.POINT_THEME, color, { maxAgeSec: ONE_YEAR });
  };

  return (
    <PointThemeContext.Provider value={{ pointColor, setPointColor }}>
      {children}
    </PointThemeContext.Provider>
  );
}

export function usePointTheme() {
  const ctx = useContext(PointThemeContext);
  if (!ctx) {
    throw new Error("usePointTheme must be used within PointThemeProvider");
  }
  return ctx;
}
