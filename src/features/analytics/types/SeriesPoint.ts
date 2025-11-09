import { z } from "zod";

export const SeriesPointSchema = z.object({
  ts: z.string(),
  views: z.number(),
  uv: z.number(),
  sessions: z.number(),
});

export type SeriesPoint = z.infer<typeof SeriesPointSchema>;