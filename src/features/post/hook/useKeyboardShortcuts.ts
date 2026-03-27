import { useEffect, useMemo, useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { PostSchema } from "@/features/post/schemas/postSchema";

/**
 * @function useKeyboardShortcuts
 * @description 브라우저 및 OS 예약 단축키를 회피한 글쓰기 단축키 훅입니다.
 *
 * - 제출: Alt + Enter (Linux OS 단축키 충돌 회피)
 * - 임시저장: Alt + S
 * - 발행 토글(옵션): Alt + Shift + P
 *
 * 안전장치:
 * - e.isComposing, e.repeat 차단
 * - 조합키만 처리 (일반 타이핑 비간섭)
 * - 전역 리스너(cleanup 포함)
 * - React Compiler 최적화를 위해 내부 콜백 함수들의 참조 무결성을 보장합니다.
 */
export function useKeyboardShortcuts(
  methods: UseFormReturn<PostSchema>,
  handleSubmit: (onValid: (data: PostSchema) => void) => () => void,
  router: AppRouterInstance,
  opts?: {
    onDraft?: (values: PostSchema) => void;
    onTogglePublish?: (values: PostSchema) => void;
    onSubmitOverride?: (values: PostSchema) => Promise<void> | void;
  },
) {
  const isMac = useMemo(
    () =>
      typeof navigator !== "undefined" &&
      /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent),
    [],
  );

  /** 운영체제에 따른 수정자 키(Modifier Key) 입력을 판별합니다. */
  const isMod = useCallback(
    (e: KeyboardEvent) => (isMac ? e.metaKey : e.ctrlKey),
    [isMac],
  );

  /** 임시저장 동작을 수행합니다. */
  const draft = useCallback(() => {
    const v = methods.getValues();
    if (opts?.onDraft) opts.onDraft(v);
    else console.debug("[draft]", v);
  }, [methods, opts]);

  /** 발행 상태 토글 동작을 수행합니다. */
  const togglePublish = useCallback(() => {
    const v = methods.getValues();
    if (opts?.onTogglePublish) opts.onTogglePublish(v);
    else console.debug("[togglePublish]", v);
  }, [methods, opts]);

  /** 제출 동작을 수행합니다. 재정의된 동작이 없을 경우 기본 경로로 이동합니다. */
  const submit = useCallback(
    async (data: PostSchema) => {
      if (opts?.onSubmitOverride) return void opts.onSubmitOverride(data);
      console.debug("[submit]", data);
      router.push("/");
    },
    [opts, router],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // 일반 타이핑 보호
      if (e.isComposing || e.repeat) return;

      // 조합키 없는 단일키는 무시
      const hasCombo = e.altKey || e.shiftKey || isMod(e);
      if (!hasCombo) return;

      const key = e.key.toLowerCase();

      // 제출: Alt + Enter
      if (!isMod(e) && e.altKey && !e.shiftKey && key === "enter") {
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

      // 발행 토글(옵션): Alt + Shift + P
      if (!isMod(e) && e.altKey && e.shiftKey && key === "p") {
        e.preventDefault();
        togglePublish();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSubmit, isMod, draft, togglePublish, submit]);
}
