import "client-only";
import { AppUser, AppUserSchema } from "@/features/auth/types/AppUser";
import { clientFetch, isSuccess } from "@/lib/api/clientFetch";

export default async function authMe(): Promise<AppUser | null> {
  const res = await clientFetch<AppUser>("/api/v1/auth/me", {
    cache: "no-cache",
    credentials: "include",
    dataSchema: AppUserSchema,
    logger: () => {},
  });

  if (isSuccess(res)) return res.data ?? null;

  const code = res.error.code;
  if (code === "error.unauthorized" || code === "error.forbidden") {
    // 세션 없음/권한 없음 → 비로그인 상태로 진행
    return null;
  }

  // 그 외는 진짜 문제니까 터뜨림
  throw new Error(`[${code}] ${res.error.message}`);
}
