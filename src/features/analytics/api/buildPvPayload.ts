"use client";

import { getClientId, getSessionId } from "@/shared/ids";

export function buildPvPayload() {
  return {
    type: "page_view" as const,
    ts: Date.now(),
    cid: getClientId(),
    sid: getSessionId(),
    url: location.href,
    ref: document.referrer || undefined,
    title: document.title || undefined,
    lang: navigator.language,
    ua: navigator.userAgent,
    vp: { w: innerWidth, h: innerHeight },
    utm: Object.fromEntries(
      Array.from(new URLSearchParams(location.search)).filter(
        ([k, v]) => k.startsWith("utm_") && v,
      ),
    ),
  };
}
