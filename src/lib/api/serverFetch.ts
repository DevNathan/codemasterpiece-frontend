import "server-only";
import { z } from "zod";
import { cookies } from "next/headers";
import {
  type ApiResult,
  type ErrorResponse,
  ErrorResponseSchema,
  isSuccess as isSuccessApiResult,
  type SuccessResponse,
  SuccessResponseSchema,
} from "@/lib/api/fetchSchema";
import { HEADERS } from "@/lib/constants/headers";
import { COOKIES } from "@/lib/constants/cookies";

/* -------------------------------------------------------------------------------------------------
 * 타입 정의
 * -----------------------------------------------------------------------------------------------*/

/**
 * 서버 사이드에서 사용하는 fetch 옵션 확장형
 *
 * - JSON 요청 자동 처리 (`json`)
 * - 응답 데이터 검증 스키마 지정 (`dataSchema`)
 * - 현재 요청의 쿠키 자동 포워딩 (`forwardCookies`)
 * - 클라이언트 식별 키(`X-Client-Key`) 자동 주입 (`forwardClientKey`)
 * - 쿠키 추가/덮어쓰기 가능 (`extraCookies`)
 */
export type ServerFetchOptions = Omit<RequestInit, "body" | "headers"> & {
  /** JSON 본문 (자동으로 Content-Type 지정 및 stringify 처리) */
  json?: unknown;
  /** 응답 본문의 data 필드에 대한 zod 스키마 (기본 any) */
  dataSchema?: z.ZodTypeAny;
  /** 에러 로깅 함수 (기본 console.error) */
  logger?: (msg?: any, ...args: any[]) => void;
  /** 요청 쿠키 자동 포워딩 여부 (기본 true) */
  forwardCookies?: boolean;
  /** 개별 쿠키 추가 또는 덮어쓰기 (예: { JSESSIONID }) */
  extraCookies?: Record<string, string | undefined>;
  /** X-Client-Key 자동 주입 여부 (기본 true) */
  forwardClientKey?: boolean;
  /** 추가 헤더 (중복 시 이 값이 우선) */
  headers?: Record<string, string>;
};

export { isSuccessApiResult as isSuccess };

/* -------------------------------------------------------------------------------------------------
 * 메인 함수
 * -----------------------------------------------------------------------------------------------*/

/**
 * 서버 전용 fetch 유틸리티
 *
 * 기능 요약:
 * - 내부 도메인 기준 URL 해석 (INTERNAL_SERVER_DOMAIN)
 * - 쿠키 자동 포워딩
 * - X-Client-Key 헤더 자동 삽입 (client-id 쿠키 기반)
 * - zod 기반 응답 스키마 검증
 * - 예외/에러 로깅
 *
 * @example
 * const res = await serverFetch<UserDTO>("/api/v1/me", {
 *   method: "GET",
 *   dataSchema: UserDTOSchema,
 * });
 * if (res.ok) console.log(res.data);
 */
export async function serverFetch<T = unknown>(
  input: string | URL | Request,
  opts: ServerFetchOptions = {},
): Promise<ApiResult<T>> {
  const {
    json,
    headers,
    dataSchema = z.any(),
    logger = console.error,
    forwardCookies = true,
    extraCookies,
    forwardClientKey = true,
    ...init
  } = opts;

  // 1) 헤더 구성
  const reqHeaders = new Headers({
    accept: "application/json",
    ...(headers ?? {}),
  });
  if (json !== undefined) {
    reqHeaders.set("content-type", "application/json; charset=utf-8");
  }

  // 2) 쿠키 자동 포워딩
  if (forwardCookies && !reqHeaders.has("cookie")) {
    const cookieHeader = await buildCookieHeader(extraCookies);
    if (cookieHeader) reqHeaders.set("cookie", cookieHeader);
  }

  // 3) X-Client-Key 자동 주입 (이미 있으면 건드리지 않음)
  if (forwardClientKey && !reqHeaders.has(HEADERS.CLIENT_KEY)) {
    try {
      const jar = await cookies();
      const clientId = jar.get(COOKIES.CLIENT_ID)?.value;
      if (clientId) reqHeaders.set(HEADERS.CLIENT_KEY, clientId);
    } catch {
      // 환경에 따라 cookies()가 실패할 수도 있음 (무시)
    }
  }

  // 4) URL 절대경로 해석
  const url = buildUrl(input);

  // 5) fetch 호출
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: reqHeaders,
      body: json !== undefined ? JSON.stringify(json) : (init as any)?.body,
    });
  } catch (err) {
    const now = new Date().toISOString();
    logger("[serverFetch] 네트워크 실패", {
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
  }

  // 6) JSON 파싱
  let body: unknown;
  try {
    body = await res.json();
  } catch (err) {
    const now = new Date().toISOString();
    const traceId = res.headers.get("x-trace-id") ?? null;
    logger("[serverFetch] JSON 파싱 실패", {
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
      error: {
        code: "error.request.body",
        message: "JSON 파싱 실패 또는 본문 없음",
      },
    };
  }

  // 7) 응답 스키마 검증
  if (res.ok) {
    const s = SuccessResponseSchema(dataSchema).safeParse(body);
    if (s.success) return { ok: true, ...(s.data as SuccessResponse<T>) };

    const e = ErrorResponseSchema.safeParse(body);
    if (e.success) {
      const traceId = e.data.traceId ?? res.headers.get("x-trace-id") ?? null;
      logger("[serverFetch] 비표준 성공 응답 (에러 바디)", {
        url: res.url,
        status: res.status,
        traceId,
        code: e.data.error.code,
        message: e.data.error.message,
      });
      return { ok: false, ...(e.data as ErrorResponse) };
    }
  } else {
    const e = ErrorResponseSchema.safeParse(body);
    if (e.success) {
      const traceId = e.data.traceId ?? res.headers.get("x-trace-id") ?? null;
      logger("[serverFetch] 서버 오류 응답", {
        url: res.url,
        status: res.status,
        traceId,
        code: e.data.error.code,
        message: e.data.error.message,
      });
      return { ok: false, ...(e.data as ErrorResponse) };
    }
  }

  // 8) 예기치 않은 응답 모양
  const now = new Date().toISOString();
  const traceId =
    (body as any)?.traceId ?? res.headers.get("x-trace-id") ?? null;
  logger("[serverFetch] 예상치 못한 응답 형태", {
    url: res.url,
    status: res.status,
    traceId,
    body,
    timestamp: now,
  });
  return {
    ok: false,
    timestamp: now,
    traceId,
    path: (body as any)?.path ?? pathOf(res.url),
    error: {
      code: "error.response.shape",
      message: "응답 형태가 예상과 다릅니다.",
    },
  };
}

/**
 * 성공 응답이 아닐 경우 예외를 던지는 버전
 *
 * @throws Error - `[code] message` 형태의 에러
 * @example
 * const { data } = await serverFetchOrThrow<UserDTO>("/api/v1/me", {
 *   method: "GET",
 *   dataSchema: UserDTOSchema,
 * });
 */
export async function serverFetchOrThrow<T = unknown>(
  input: string | URL | Request,
  opts: ServerFetchOptions = {},
): Promise<SuccessResponse<T>> {
  const res = await serverFetch<T>(input, opts);
  if (isSuccessApiResult(res)) return res;
  throw new Error(`[${res.error.code}] ${res.error.message}`);
}

/* -------------------------------------------------------------------------------------------------
 * 유틸 함수
 * -----------------------------------------------------------------------------------------------*/

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

/** URL에서 pathname만 추출 (로그용) */
function pathOf(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

/**
 * 현재 요청의 쿠키를 모두 모아 Cookie 헤더 문자열로 변환
 * extra로 받은 쿠키는 기존 값을 덮어쓴다.
 */
async function buildCookieHeader(
  extra?: Record<string, string | undefined>,
): Promise<string | undefined> {
  try {
    const jar = new Map<string, string>();
    const cookieStore = await cookies();

    // 현재 요청의 모든 쿠키를 모음
    for (const c of cookieStore.getAll()) {
      jar.set(c.name, encodeURIComponent(c.value));
    }

    // 추가 쿠키 반영
    if (extra) {
      for (const [k, v] of Object.entries(extra)) {
        if (v == null) continue;
        jar.set(k, encodeURIComponent(v));
      }
    }

    if (jar.size === 0) return undefined;
    return Array.from(jar.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  } catch {
    return undefined;
  }
}
