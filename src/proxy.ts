import { NextRequest, NextResponse } from "next/server";
import { ulid } from "ulid";
import { COOKIES } from "@/lib/constants/cookies";

const INTERNAL_API_DOMAIN = process.env.INTERNAL_API_DOMAIN!;
const ONE_YEAR = 60 * 60 * 24 * 365;
const isProd = process.env.NODE_ENV === "production";

/** 인증 없이 접근 허용 */
const WHITE_LIST = [
  /^\/$/, // 홈
  /^\/posts(?:\/.*)?$/, // /posts, /posts/**
  /^\/post(?:\/.*)?$/, // /post, /post/**
  /^\/guest$/, // 방명록
  /^\/policy$/, // 방명록
];

/** API 라우트 식별 */
const API_ROUTE = /^\/api(?:\/|$)/;

/** 정적/내부 리소스는 미들웨어 제외 */
const INTERNAL_SKIP = [
  /^\/_next\//,
  /^\/favicon\.ico$/,
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
  /^\/images\//,
  /^\/assets\//,
  /^\/fonts\//,
];

function isWhitelisted(pathname: string) {
  return WHITE_LIST.some((re) => re.test(pathname));
}
function isInternal(pathname: string) {
  return INTERNAL_SKIP.some((re) => re.test(pathname));
}

/** CL-ULID 쿠키 부여 */
function ensureClientIdCookie(req: NextRequest, res: NextResponse) {
  const existing = req.cookies.get(COOKIES.CLIENT_ID)?.value;
  if (existing) return;
  const id = `CL-${ulid()}`;
  res.cookies.set({
    name: COOKIES.CLIENT_ID,
    value: id,
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
    httpOnly: false,
    secure: isProd,
  });
}

/** 세션 핑 */
async function pingSession(
  req: NextRequest,
): Promise<{ ok: boolean; expMs?: number }> {
  const cookieHeader = req.headers.get("cookie") ?? "";

  try {
    const resp = await fetch(`${INTERNAL_API_DOMAIN}/api/v1/auth/ping`, {
      method: "GET",
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (resp.status === 401) return { ok: false };
    if (!resp.ok) return { ok: false };
    const data = (await resp.json()) as { ok: boolean; expMs?: number };
    return { ok: !!data?.ok, expMs: data?.expMs };
  } catch {
    return isProd ? { ok: false } : { ok: true };
  }
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 내부/정적 리소스 패스
  if (isInternal(pathname)) return NextResponse.next();

  const res = NextResponse.next();

  // ClientId 쿠키 확보
  ensureClientIdCookie(req, res);

  // 화이트리스트면 검증 생략
  if (isWhitelisted(pathname)) return res;

  // 인증 검증
  const { ok } = await pingSession(req);

  if (ok) return res;

  const notFoundUrl = new URL("/404", req.url);
  return NextResponse.rewrite(notFoundUrl);
}
