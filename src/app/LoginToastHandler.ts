"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { clientFetch } from "@/lib/api/clientFetch";

const I18nMessageSchema = z.object({ message: z.string() });

export default function AuthToastHandler() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const login = params.get("login");
    const logout = params.get("logout");
    const code = params.get("code") ?? undefined;
    const args = params.get("args") ?? undefined;

    // 아무 플래그도 없으면 패스
    if (!login && !logout) return;

    (async () => {
      const q = new URLSearchParams();
      if (code) q.set("code", code);
      if (args) q.append("args", args);

      let msg = "";
      if (code) {
        const res = await clientFetch<{ message: string }>(
          `/api/v1/i18n/message?${q.toString()}`,
          { dataSchema: I18nMessageSchema }
        );
        msg = res.ok ? res.data!.message : "";
      }

      // fallback 문구
      if (!msg) {
        if (login === "success") msg = args ? `환영합니다, ${args}님.` : "로그인되었습니다.";
        else if (login === "fail") msg = "로그인에 실패했습니다.";
        else if (logout === "success") msg = "로그아웃되었습니다.";
      }

      // 토스트 발사
      if (login === "fail") toast.error(msg);
      else toast.success(msg);

      // 쿼리 정리 (현재 경로만 유지)
      router.replace(window.location.pathname);
    })();
  }, [params, router]);

  return null;
}
