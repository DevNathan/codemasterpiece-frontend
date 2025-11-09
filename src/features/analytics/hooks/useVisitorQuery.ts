"use client";

import { useQuery } from "@tanstack/react-query";
import getVisitorChart from "@/features/analytics/api/getVisitorChart";
import { SeriesPoint } from "@/features/analytics/types/SeriesPoint";

export function useVisitorsQuery({
  period,
  from,
  to,
}: {
  period: "day" | "week" | "month";
  from: string;
  to: string;
}) {
  const q = useQuery({
    queryKey: ["analytics", "visitors", period, from, to],
    queryFn: async (): Promise<SeriesPoint[]> => {
      const res = await getVisitorChart({
        type: period,
        from: new Date(from),
        to: new Date(to),
      });
      return res.data ?? [];
    },
    staleTime: 30_000,
  });

  const series = q.data ?? [];

  // 합계
  const totals = series.reduce(
    (a, d) => ({
      pv: a.pv + (d.views ?? 0),
      uv: a.uv + (d.uv ?? 0),
      session: a.session + (d.sessions ?? 0),
    }),
    { pv: 0, uv: 0, session: 0 },
  );

  // 이전 절반 구간 대비 증감
  let prevDelta: { pv: number; uv: number; session: number } | undefined =
    undefined;
  if (series.length >= 2) {
    const mid = Math.floor(series.length / 2);
    const sum = (arr: typeof series) =>
      arr.reduce(
        (a, d) => ({
          pv: a.pv + (d.views ?? 0),
          uv: a.uv + (d.uv ?? 0),
          session: a.session + (d.sessions ?? 0),
        }),
        { pv: 0, uv: 0, session: 0 },
      );
    const A = sum(series.slice(0, mid));
    const B = sum(series.slice(mid));
    prevDelta = {
      pv: B.pv - A.pv,
      uv: B.uv - A.uv,
      session: B.session - A.session,
    };
  }

  return { ...q, data: series, totals, prevDelta };
}
