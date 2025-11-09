// features/post/hook/useKeyboardShortcuts.ts
"use client";

import { useEffect, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { PostSchema } from "@/features/post/schemas/postSchema";

/**
 * 브라우저 예약 단축키를 회피한 글쓰기 단축키 훅
 *
 * - 제출: Mod + Enter (권장, 대부분 충돌 없음)
 * - 임시저장: Alt + S
 * - 미리보기: Alt + P
 * - 발행 토글(옵션): Alt + Shift + P
 *
 * 안전장치:
 * - e.isComposing, e.repeat 차단
 * - 조합키만 처리 (일반 타이핑 비간섭)
 * - 전역 리스너(cleanup 포함)
 */
export function useKeyboardShortcuts(
  methods: UseFormReturn<PostSchema>,
  handleSubmit: (onValid: (data: PostSchema) => void) => () => void,
  router: AppRouterInstance,
  opts?: {
    onDraft?: (values: PostSchema) => void;
    onPreview?: (values: PostSchema) => void;
    onTogglePublish?: (values: PostSchema) => void;
    onSubmitOverride?: (values: PostSchema) => Promise<void> | void;
  },
) {
  const isMac = useMemo(
    () =>
      typeof navigator !== "undefined" &&
      /Mac|iPhone|iPad|iPod/.test(navigator.platform),
    [],
  );

  const isMod = (e: KeyboardEvent) => (isMac ? e.metaKey : e.ctrlKey);

  const draft = () => {
    const v = methods.getValues();
    if (opts?.onDraft) opts.onDraft(v);
    else console.debug("[draft]", v);
  };

  const preview = () => {
    const v = methods.getValues();
    if (opts?.onPreview) opts.onPreview(v);
    else console.debug("[preview]", v);
  };

  const togglePublish = () => {
    const v = methods.getValues();
    if (opts?.onTogglePublish) opts.onTogglePublish(v);
    else console.debug("[togglePublish]", v);
  };

  const submit = async (data: PostSchema) => {
    if (opts?.onSubmitOverride) return void opts.onSubmitOverride(data);
    // 기본 제출 동작: 성공 후 홈으로 이동(원하면 교체)
    console.debug("[submit]", data);
    router.push("/");
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // 일반 타이핑 보호
      if (e.isComposing || e.repeat) return;

      // 조합키 없는 단일키는 무시
      const hasCombo = e.altKey || e.shiftKey || isMod(e);
      if (!hasCombo) return;

      const key = e.key.toLowerCase();

      // 제출: Mod + Enter
      if (isMod(e) && key === "enter") {
        e.preventDefault();
        handleSubmit(submit)();
        return;
      }

      // 임시저장: Alt + S
      if (!isMod(e) && e.altKey && !e.shiftKey && key === "s") {
        e.preventDefault();
        draft();
        return;
      }

      // 미리보기: Alt + P
      if (!isMod(e) && e.altKey && !e.shiftKey && key === "p") {
        e.preventDefault();
        preview();
        return;
      }

      // 발행 토글(옵션): Alt + Shift + P
      if (!isMod(e) && e.altKey && e.shiftKey && key === "p") {
        e.preventDefault();
        togglePublish();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSubmit, isMac]);
}
