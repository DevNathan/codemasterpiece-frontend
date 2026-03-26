"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(`[Web Vitals] ${metric.name}: ${Math.round(metric.value)}ms`);
  });

  return null;
}
