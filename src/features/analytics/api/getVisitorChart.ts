import "client-only";
import { clientFetchOrThrow } from "@/lib/api/clientFetch";
import { z } from "zod";
import {
  SeriesPoint,
  SeriesPointSchema,
} from "@/features/analytics/types/SeriesPoint";

export type VisitorRangeType = "day" | "week" | "month";

type Params = {
  type: VisitorRangeType;
  from: Date;
  to: Date;
};

export default async function getVisitorChart({ type, from, to }: Params) {
  const fromParam = toLocalDateParam(from);
  const toParam = toLocalDateParam(to);

  return clientFetchOrThrow<SeriesPoint[]>(
    `/api/v1/analytics/visitors/${type}?from=${encodeURIComponent(fromParam)}&to=${encodeURIComponent(toParam)}`,
    {
      method: "GET",
      dataSchema: z.array(SeriesPointSchema),
    },
  );
}

function toLocalDateParam(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
