import "server-only";
import { z } from "zod";
import {
  type ApiResult,
  type ErrorResponse,
  ErrorResponseSchema,
  isSuccess as isSuccessApiResult,
  type SuccessResponse,
  SuccessResponseSchema,
} from "@/lib/api/fetchSchema";

/**
 * 쿠키/세션/클라키 일절 금지한 프리렌더/메타데이터 전용 fetch 유틸
 * - cookies() 호출 없음
 * - Cookie 헤더 강제 제거
 * - credentials: "omit"
 * - AbortController 기반 timeout 지원
 * - 성공/에러 응답 스키마 검증 유지
 */

export type StaticFetchOptions = Omit<RequestInit, "headers" | "body" | "credentials"> & {
  /** JSON 본문(자동 stringify) */
  json?: unknown;
  /** data 필드 zod 스키마 (기본 any) */
  dataSchema?: z.ZodTypeAny;
  /** 추가 헤더(단, Cookie는 무조건 제거) */
  headers?: Record<string, string>;
  /** 타임아웃(ms). 기본 3000 */
  timeoutMs?: number;
  /** 로거 (기본 console.error) */
  logger?: (msg?: any, ...args: any[]) => void;
};

export { isSuccessApiResult as isSuccess };

export async function staticServerFetch<T = unknown>(
  input: string | URL | Request,
  opts: StaticFetchOptions = {},
): Promise<ApiResult<T>> {
  const {
    json,
    headers,
    dataSchema = z.any(),
    timeoutMs = 3000,
    logger = console.error,
    ...init
  } = opts;

  // 헤더 구성 (쿠키는 절대 금지)
  const reqHeaders = new Headers({
    accept: "application/json",
    ...(headers ?? {}),
  });
  reqHeaders.delete("cookie");
  if (json !== undefined) {
    reqHeaders.set("content-type", "application/json; charset=utf-8");
  }

  const url = buildUrl(input);

  // AbortController + timeout
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new DOMException("Timeout", "AbortError")),
    timeoutMs,
  );

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: reqHeaders,
      body: json !== undefined ? JSON.stringify(json) : (init as any)?.body,
      signal: controller.signal,
      credentials: "omit",
    });
  } catch (err: any) {
    clearTimeout(timer);
    const now = new Date().toISOString();

    if (err?.name === "AbortError") {
      return {
        ok: false,
        timestamp: now,
        traceId: null,
        path: pathOf(url),
        error: { code: "error.timeout", message: "요청 타임아웃" },
      };
    }

    logger("[staticServerFetch] 네트워크 실패", {
      url,
      error: String(err),
      timestamp: now,
    });
    return {
      ok: false,
      timestamp: now,
      traceId: null,
      path: pathOf(url),
      error: { code: "error.network", message: "네트워크 연결 실패" },
    };
  } finally {
    clearTimeout(timer);
  }

  // 본문 파싱
  let body: unknown;
  try {
    body = await res.json();
  } catch (err) {
    const now = new Date().toISOString();
    const traceId = res.headers.get("x-trace-id") ?? null;
    logger("[staticServerFetch] JSON 파싱 실패", {
      url: res.url,
      status: res.status,
      traceId,
      error: String(err),
      timestamp: now,
    });
    return {
      ok: false,
      timestamp: now,
      traceId,
      path: pathOf(res.url),
      error: { code: "error.request.body", message: "JSON 파싱 실패 또는 본문 없음" },
    };
  }

  // 스키마 검증
  if (res.ok) {
    const s = SuccessResponseSchema(dataSchema).safeParse(body);
    if (s.success) return { ok: true, ...(s.data as SuccessResponse<T>) };

    const e = ErrorResponseSchema.safeParse(body);
    if (e.success) {
      const traceId = e.data.traceId ?? res.headers.get("x-trace-id") ?? null;
      logger("[staticServerFetch] 비표준 성공 응답(에러 바디)", {
        url: res.url, status: res.status, traceId,
        code: e.data.error.code, message: e.data.error.message,
      });
      return { ok: false, ...(e.data as ErrorResponse) };
    }
  } else {
    const e = ErrorResponseSchema.safeParse(body);
    if (e.success) {
      const traceId = e.data.traceId ?? res.headers.get("x-trace-id") ?? null;
      logger("[staticServerFetch] 서버 오류 응답", {
        url: res.url, status: res.status, traceId,
        code: e.data.error.code, message: e.data.error.message,
      });
      return { ok: false, ...(e.data as ErrorResponse) };
    }
  }

  // 예기치 않은 모양
  const now = new Date().toISOString();
  const traceId = (body as any)?.traceId ?? res.headers.get("x-trace-id") ?? null;
  logger("[staticServerFetch] 예상치 못한 응답 형태", {
    url: res.url, status: res.status, traceId, body, timestamp: now,
  });
  return {
    ok: false,
    timestamp: now,
    traceId,
    path: (body as any)?.path ?? pathOf(res.url),
    error: { code: "error.response.shape", message: "응답 형태가 예상과 다릅니다." },
  };
}

export async function staticServerFetchOrThrow<T = unknown>(
  input: string | URL | Request,
  opts: StaticFetchOptions = {},
): Promise<SuccessResponse<T>> {
  const res = await staticServerFetch<T>(input, opts);
  if (isSuccessApiResult(res)) return res;
  throw new Error(`[${res.error.code}] ${res.error.message}`);
}

/* ------------------------------------- utils ------------------------------------- */

function buildUrl(input: string | URL | Request): string {
  if (typeof input === "string") {
    if (input.startsWith("http")) return input;
    const base =
      process.env.INTERNAL_API_DOMAIN ??
      process.env.NEXT_PUBLIC_API_DOMAIN ??
      "";
    return `${base}${input}`;
  }
  if (input instanceof URL) return input.toString();
  return (input as Request).url;
}

function pathOf(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}
