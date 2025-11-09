"use client";

import { CookieManager } from "@/shared/module/cookieManager";
import { COOKIES } from "@/lib/constants/cookies";

export const POINT_COLORS = ["amber", "sky", "purple"] as const;
export type PointKey = (typeof POINT_COLORS)[number];
const ONE_YEAR = 60 * 60 * 24 * 365;

export function setPointColor(theme: PointKey) {
  if (!POINT_COLORS.includes(theme)) return;
  if (typeof document === "undefined") return;

  const html = document.documentElement;
  POINT_COLORS.forEach((c) => html.classList.remove(`point-${c}`));
  html.classList.add(`point-${theme}`);

  CookieManager.setItem(COOKIES.POINT_THEME, theme, { maxAgeSec: ONE_YEAR });
}
