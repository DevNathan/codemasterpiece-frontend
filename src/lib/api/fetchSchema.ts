import { z } from "zod";

/** ===== 스키마(검증용) ===== */
export const SuccessDetailSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export const SuccessResponseSchema = <S extends z.ZodTypeAny>(dataSchema: S) =>
  z.object({
    timestamp: z.string(),
    traceId: z.string().nullable().optional(),
    path: z.string(),
    detail: SuccessDetailSchema,
    data: dataSchema.nullable().optional(),
  });

export const ErrorDetailSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export const ErrorResponseSchema = z.object({
  timestamp: z.string(),
  traceId: z.string().nullable().optional(),
  path: z.string(),
  error: ErrorDetailSchema,
  validation: z.record(z.string(), z.string()).optional(),
});

export type SuccessResponse<T> = {
  timestamp: string;
  traceId?: string | null;
  path: string;
  detail: { code: string; message: string };
  data?: T | null;
};

export type ErrorResponse = {
  timestamp: string;
  traceId?: string | null;
  path: string;
  error: { code: string; message: string };
  validation?: Record<string, string>;
};

export type ApiResult<T> =
  | ({ ok: true } & SuccessResponse<T>)
  | ({ ok: false } & ErrorResponse);

export const isSuccess = <T>(
  res: ApiResult<T>,
): res is { ok: true } & SuccessResponse<T> => (res as any).ok === true;
