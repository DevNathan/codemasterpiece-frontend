import "client-only";

export interface CookieOptions {
  maxAgeSec?: number;
  path?: string;
  sameSite?: "Lax" | "Strict" | "None";
  secure?: boolean;
}

/**
 * 브라우저 쿠키 유틸
 * - 서버에서는 동작 안 함
 * - HttpOnly 쿠키는 접근 불가 (비민감용만)
 * - 서버와 동일한 쿠키 네임 유지 (프리픽스 제거)
 */
export class CookieManager {
  static setItem(name: string, value: string, opts: CookieOptions = {}) {
    if (typeof document === "undefined") return;

    const {
      maxAgeSec = 60 * 60 * 24 * 365, // 기본 1년
      path = "/",
      sameSite = "Lax",
      secure = window.location.protocol === "https:",
    } = opts;

    const cookie = [
      `${name}=${encodeURIComponent(value)}`,
      `Path=${path}`,
      `Max-Age=${maxAgeSec}`,
      `SameSite=${sameSite}`,
      secure ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ");

    document.cookie = cookie;
  }

  static getItem(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${name}=([^;]*)`),
    );
    return match ? decodeURIComponent(match[1]) : null;
  }

  static removeItem(name: string) {
    if (typeof document === "undefined") return;
    this.setItem(name, "", { maxAgeSec: 0 });
  }

  static clearAll() {
    if (typeof document === "undefined") return;
    const cookies = document.cookie.split(";").map((c) => c.trim());
    cookies.forEach((c) => {
      const [k] = c.split("=");
      document.cookie = `${k}=; Max-Age=0; Path=/; SameSite=Lax`;
    });
  }
}
