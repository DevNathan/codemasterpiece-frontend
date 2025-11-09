// src/features/analytics/utils/saveAsCsv.ts
import type { SeriesPoint } from "@/features/analytics/types/SeriesPoint";

type Data = {
  series: SeriesPoint[];
  totals: { pv: number; uv: number; session: number };
};

export function saveAsCsv(data: Data, filename = "visitors.csv") {
  const rows = [
    ["date", "pv", "uv", "session"],
    ...data.series.map((p) => [
      p.ts,
      String(p.views ?? 0),
      String(p.uv ?? 0),
      String(p.sessions ?? 0),
    ]),
    [],
    [
      "TOTALS",
      String(data.totals.pv),
      String(data.totals.uv),
      String(data.totals.session),
    ],
  ];

  const csv = rows.map((r) => r.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function escapeCsv(s: string) {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
