"use client";

import { clientFetch } from "@/lib/api/clientFetch";
import { buildPvPayload } from "@/features/analytics/api/buildPvPayload";

export async function sendPageView() {
  const body = buildPvPayload();

  try {
    const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
    if (navigator.sendBeacon?.(`${process.env.NEXT_PUBLIC_API_DOMAIN}/api/v1/collect`, blob)) return;
  } catch {
    /* no-op */
  }

  await clientFetch("/api/v1/collect", {
    json: body,
    keepalive: true,
  });
}
