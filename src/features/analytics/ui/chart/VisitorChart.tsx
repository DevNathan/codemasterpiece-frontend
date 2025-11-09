"use client";

import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/shadcn/chart";
import { cn } from "@/lib/utils";
import { SeriesPoint } from "@/features/analytics/types/SeriesPoint";

export default function VisitorChart({
  period,
  series,
}: {
  period: "day" | "week" | "month";
  series: SeriesPoint[];
}) {
  const chartData = useMemo(
    () => (series ?? []).slice().sort((a, b) => a.ts.localeCompare(b.ts)),
    [series],
  );

  const nf = new Intl.NumberFormat("ko-KR");
  const maxY = chartData.reduce(
    (m, d) => Math.max(m, d.views ?? 0, d.uv ?? 0, d.sessions ?? 0),
    0,
  );

  function formatTick(ts: string) {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    switch (period) {
      case "day":
      case "week":
        return `${d.getMonth() + 1}/${d.getDate()}`;
      case "month":
        return `${String(d.getFullYear()).slice(2)}년 ${d.getMonth() + 1}월`;
    }
  }

  function tooltipLabel(ts: string) {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    switch (period) {
      case "day":
        return `${y}-${m}-${day}`;
      case "week":
        return `${y}-${m}-${day} 주간`;
      case "month":
        return `${y}-${m}`;
    }
  }

  return (
    <div className={cn("rounded-2xl overflow-hidden")}>
      {/*
        핵심: 높이는 aspect-ratio로 반응형 계산.
        - 모바일: 4:3, 데스크톱: 16:9
        - 실제 픽셀 높이를 보장하기 위해 min/max로 가드
        - ResponsiveContainer는 100%/100%만 사용 (숫자 고정 금지)
      */}
      <ChartContainer
        config={{
          views: { label: "페이지뷰" },
          uv: { label: "순방문자" },
          sessions: { label: "세션" },
        }}
        className={cn(
          "w-full",
          // 반응형 비율
          "aspect-[4/3] md:aspect-[16/9]",
          // 극단적 화면에서의 가드
          "min-h-[220px] max-h-[440px]",
          // 사파리/구형 브라우저 보정
          "h-auto",
        )}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ left: 8, right: 12, top: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fill-views" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--chart-views)"
                  stopOpacity="0.48"
                />
                <stop
                  offset="100%"
                  stopColor="var(--chart-views)"
                  stopOpacity="0.16"
                />
              </linearGradient>
              <linearGradient id="fill-uv" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--chart-uv)"
                  stopOpacity="0.50"
                />
                <stop
                  offset="100%"
                  stopColor="var(--chart-uv)"
                  stopOpacity="0.18"
                />
              </linearGradient>
              <linearGradient id="fill-sessions" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--chart-sessions)"
                  stopOpacity="0.50"
                />
                <stop
                  offset="100%"
                  stopColor="var(--chart-sessions)"
                  stopOpacity="0.18"
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="hsl(var(--border))"
              opacity={0.4}
            />

            <XAxis
              dataKey="ts"
              tickFormatter={formatTick}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
            />

            <YAxis
              tickFormatter={(v) => nf.format(Number(v))}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              width={56}
              allowDecimals={false}
            />

            {maxY > 0 && (
              <ReferenceLine
                y={maxY}
                stroke="hsl(var(--border))"
                strokeOpacity={0.35}
                strokeDasharray="4 6"
              />
            )}

            <ChartTooltip
              cursor={{ stroke: "hsl(var(--border))", strokeOpacity: 0.4 }}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={tooltipLabel}
                />
              }
            />

            <Area
              name="페이지뷰"
              dataKey="views"
              type="monotone"
              stroke="var(--chart-views)"
              strokeWidth={2.8}
              strokeOpacity={0.98}
              fill="url(#fill-views)"
              fillOpacity={1}
              activeDot={{ r: 4.2 }}
            />
            <Area
              name="순방문자"
              dataKey="uv"
              type="monotone"
              stroke="var(--chart-uv)"
              strokeWidth={2.8}
              strokeOpacity={0.98}
              fill="url(#fill-uv)"
              fillOpacity={1}
              activeDot={{ r: 4.2 }}
            />
            <Area
              name="세션"
              dataKey="sessions"
              type="monotone"
              stroke="var(--chart-sessions)"
              strokeWidth={2.8}
              strokeOpacity={0.98}
              fill="url(#fill-sessions)"
              fillOpacity={1}
              activeDot={{ r: 4.2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
