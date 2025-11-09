"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { sendPageView } from "@/features/analytics/api/sendPv";

export default function PageViewBeacon() {
  const pathname = usePathname();
  const search = useSearchParams();
  const lastKey = useRef("");

  useEffect(() => {
    if (!pathname) return;

    const url = `${location.origin}${pathname}${search?.toString() ? `?${search}` : ""}`;
    const key = `${url}|${document.title}`;
    if (lastKey.current === key) return;
    lastKey.current = key;

    void sendPageView();
  }, [pathname, search]);

  return null;
}
