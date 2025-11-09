import "client-only";
import { z } from "zod";
import {
  type ApiResult,
  type ErrorResponse,
  ErrorResponseSchema,
  isSuccess as isSuccessApiResult,
  type SuccessResponse,
  SuccessResponseSchema,
} from "@/lib/api/fetchSchema";
import { CookieManager } from "@/shared/module/cookieManager";
import { COOKIES } from "@/lib/constants/cookies";
import { HEADERS } from "@/lib/constants/headers";

/* -------------------------------------------------------------------------------------------------
 * 타입 정의
 * -----------------------------------------------------------------------------------------------*/

/**
 * 클라이언트 전용 fetch 옵션
 *
 * - JSON/폼데이터 본문 처리
 * - 응답 스키마 검증(dataSchema)
 * - 기본적으로 credentials: "include"
 * - 기본적으로 X-Client-Key 자동 주입 (client-id 쿠키)
 */
export type ClientFetchOptions = Omit<RequestInit, "body" | "headers"> & {
  /** JSON 본문 (자동 Content-Type + stringify) */
  json?: unknown;
  /** FormData 본문 (브라우저가 Content-Type 설정) */
  formData?: FormData;
  /** 응답 data 필드의 zod 스키마 */
  dataSchema?: z.ZodTypeAny;
  /** 추가 헤더 (중복 시 이 값이 우선) */
  headers?: Record<string, string>;
  /** 로거 (기본 console.error) */
  logger?: (msg?: any, ...args: any[]) => void;
  /** X-Client-Key 자동 주입 비활성화 (기본 true) */
  forwardClientKey?: boolean;
};

export { isSuccessApiResult as isSuccess };

/* -------------------------------------------------------------------------------------------------
 * 메인
 * -----------------------------------------------------------------------------------------------*/

/**
 * 클라이언트 전용 fetch:
 * - BASE: NEXT_PUBLIC_SERVER_DOMAIN
 * - 2xx → SuccessResponse<T> 스키마 검증
 * - !2xx → ErrorResponse 스키마 검증
 * - 모양 불일치 시 error.response.shape로 표준화
 * - client-id 쿠키를 X-Client-Key로 자동 주입(기본)
 */
export async function clientFetch<T = unknown>(
  input: string | URL,
  opts: ClientFetchOptions = {},
): Promise<ApiResult<T>> {
  const {
    json,
    formData,
    dataSchema = z.any(),
    headers = {},
    logger = console.error,
    credentials = "include",
    forwardClientKey = true,
    ...init
  } = opts;

  // JSON과 FormData는 상호 배타
  if (json !== undefined && formData !== undefined) {
    const now = new Date().toISOString();
    logger("[clientFetch] Both json and formData provided", { timestamp: now });
    return {
      ok: false,
      timestamp: now,
      traceId: null,
      path:
        typeof input === "string"
          ? pathOf(buildUrl(input))
          : pathOf(input.toString()),
      error: {
        code: "error.request.body",
        message: "Provide either json or formData, not both",
      },
    };
  }

  const url = buildUrl(input);

  // 기본 헤더
  // - Accept-Language: 명시 헤더가 없으면 브라우저 선호 언어 → 단일 언어 → ko-KR 순으로 설정
  const langHeader =
    headers["accept-language"] ??
    (typeof navigator !== "undefined"
      ? Array.isArray((navigator as any).languages) &&
        (navigator as any).languages.length > 0
        ? (navigator as any).languages.join(", ")
        : navigator.language
      : "ko-KR");

  const reqHeaders: Record<string, string> = {
    accept: "application/json",
    "accept-language": langHeader,
    ...headers,
  };

  // X-Client-Key 자동 주입 (이미 있으면 건드리지 않음)
  if (forwardClientKey && !reqHeaders[HEADERS.CLIENT_KEY]) {
    const clientId = CookieManager.getItem(COOKIES.CLIENT_ID);
    if (clientId) reqHeaders[HEADERS.CLIENT_KEY] = clientId;
  }

  // 바디 구성
  let body: BodyInit | undefined;
  if (json !== undefined) {
    reqHeaders["content-type"] = "application/json; charset=utf-8";
    body = JSON.stringify(json);
  } else if (formData !== undefined) {
    // FormData는 브라우저가 Content-Type(boundary 포함) 자동 설정
    body = formData;
  }

  // 요청
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      credentials,
      headers: reqHeaders,
      body,
    });
  } catch (err) {
    const now = new Date().toISOString();
    logger("[clientFetch] Network failure", {
      url,
      error: String(err),
      timestamp: now,
    });
    return {
      ok: false,
      timestamp: now,
      traceId: null,
      path: pathOf(url),
      error: { code: "error.network", message: "Network failure" },
    };
  }

  // 응답 JSON 파싱
  let payload: unknown;
  try {
    payload = await res.json();
  } catch (err) {
    const now = new Date().toISOString();
    logger("[clientFetch] JSON parse error", {
      url: res.url,
      status: res.status,
      statusText: res.statusText,
      error: String(err),
      timestamp: now,
    });
    return {
      ok: false,
      timestamp: now,
      traceId: null,
      path: pathOf(res.url),
      error: {
        code: "error.request.body",
        message: "Invalid or missing JSON body",
      },
    };
  }

  // 스키마 검증
  if (res.ok) {
    const s = SuccessResponseSchema(dataSchema).safeParse(payload);
    if (s.success) return { ok: true, ...(s.data as SuccessResponse<T>) };

    const e = ErrorResponseSchema.safeParse(payload);
    if (e.success) {
      logger("[clientFetch] Non-standard 2xx with error body", {
        url: res.url,
        status: res.status,
        code: e.data.error.code,
        message: e.data.error.message,
      });
      return { ok: false, ...(e.data as ErrorResponse) };
    }
  } else {
    const e = ErrorResponseSchema.safeParse(payload);
    if (e.success) return { ok: false, ...(e.data as ErrorResponse) };
  }

  // 예상치 못한 응답 형태
  const now = new Date().toISOString();
  logger("[clientFetch] Unexpected response shape", {
    url: res.url,
    status: res.status,
    body: payload,
    timestamp: now,
  });
  return {
    ok: false,
    timestamp: now,
    traceId: (payload as any)?.traceId ?? null,
    path: (payload as any)?.path ?? pathOf(res.url),
    error: {
      code: "error.response.shape",
      message: "Unexpected response shape",
    },
  };
}

/** 성공 아니면 throw */
export async function clientFetchOrThrow<T = unknown>(
  input: string | URL,
  opts: ClientFetchOptions = {},
): Promise<SuccessResponse<T>> {
  const res = await clientFetch<T>(input, opts);
  if (isSuccessApiResult(res)) return res;
  throw new Error(`[${res.error.code}] ${res.error.message}`);
}

/* -------------------------------------------------------------------------------------------------
 * RHF 통합(옵션): 서버 validation → RHF 에러 매핑 유틸 + 래퍼 (토스트 제거)
 * -----------------------------------------------------------------------------------------------*/
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

/** 서버 표준 에러(축약 타입) */
export type StandardError = {
  ok: false;
  timestamp: string;
  traceId: string | null;
  path: string;
  error: { code: string; message: string };
  validation?: Record<string, string>;
};

/**
 * 서버 validation 맵을 RHF 에러로 반영하고 첫 필드로 포커스 이동.
 * true 반환 시 validation 에러를 처리했음(상위에서 추가 처리 불필요).
 */
export function applyServerValidation<T extends FieldValues>(
  form: UseFormReturn<T>,
  res: StandardError,
  opts?: {
    /** 서버 키 ↔ 폼 키 매핑 (서버와 폼 필드명이 다를 때) */
    fieldMap?: Record<string, Path<T>>;
  },
): boolean {
  if (res.error?.code !== "error.validation" || !res.validation) return false;

  const { fieldMap = {} } = opts ?? {};
  const vmap = res.validation;
  const keys = Object.keys(vmap);
  if (keys.length === 0) return true;

  for (const k of keys) {
    const mapped = (fieldMap[k] ?? (k as Path<T>)) as Path<T>;
    form.setError(mapped, { type: "server", message: vmap[k] });
  }
  const first = (fieldMap[keys[0]] ?? (keys[0] as Path<T>)) as Path<T>;
  form.setFocus(first);

  return true;
}

/**
 * RHF와 함께 쓰는 fetch 래퍼:
 * - 성공: 그대로 성공 응답 반환
 * - 실패:
 *    - validation: RHF setError/setFocus 적용, onValidationError 콜백 호출
 *    - 그 외: onNonValidationError 콜백 호출
 */
export async function clientFetchWithForm<
  TData = unknown,
  TForm extends FieldValues = FieldValues,
>(
  input: string | URL,
  opts: ClientFetchOptions & {
    form: UseFormReturn<TForm>;
    fieldMap?: Record<string, Path<TForm>>;
    onValidationError?: (res: StandardError) => void;
    onNonValidationError?: (res: StandardError) => void;
  },
): Promise<ApiResult<TData>> {
  const { form, fieldMap, onValidationError, onNonValidationError, ...rest } =
    opts;
  const res = await clientFetch<TData>(input, rest);

  if (isSuccessApiResult(res)) return res;

  const std = res as unknown as StandardError;
  const handled = applyServerValidation<TForm>(form, std, { fieldMap });

  if (handled) {
    onValidationError?.(std);
  } else {
    onNonValidationError?.(std);
  }
  return res;
}

/* -------------------------------------------------------------------------------------------------
 * 유틸
 * -----------------------------------------------------------------------------------------------*/

/** 상대 경로면 NEXT_PUBLIC_API_DOMAIN 기준으로 절대 경로 생성 */
function buildUrl(input: string | URL): string {
  if (typeof input === "string") {
    if (input.startsWith("http")) return input;
    const base = process.env.NEXT_PUBLIC_API_DOMAIN ?? "";
    return `${base}${input}`;
  }
  return input.toString();
}

/** URL에서 pathname만 추출 (로그 간결화) */
function pathOf(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}
