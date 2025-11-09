"use client";

import { useEffect, useRef } from "react";
import type { UseFormGetValues, UseFormReset } from "react-hook-form";
import type { PostSchema } from "@/features/post/schemas/postSchema";
import { LOCALS } from "@/lib/constants/localstorages";
import { LocalStorage } from "@/shared/module/localStorage";

type PostFormValues = PostSchema & {
  headImagePreview?: string; // UI-only
};

type LocalDraft = {
  ts: number;
  values: PostFormValues;
};

function getDraftKey(postId?: string) {
  return postId
    ? `${LOCALS.DRAFT_EDIT_POST_PREFIX}${postId}`
    : LOCALS.DRAFT_NEW_POST;
}

export function useDraft({
  postId,
  getValues,
  reset,
}: {
  postId?: string;
  getValues: UseFormGetValues<PostFormValues>;
  reset: UseFormReset<PostFormValues>;
}) {
  const keyRef = useRef<string>(getDraftKey(postId));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    keyRef.current = getDraftKey(postId);
  }, [postId]);

  const write = (values: PostFormValues) => {
    const payload: LocalDraft = { ts: Date.now(), values };
    LocalStorage.setItem(keyRef.current, payload);
  };

  // 호출부와 호환: values 전달 가능, 없으면 getValues()
  const scheduleAutosave = (values?: PostFormValues, delay = 1200) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => write(values ?? (getValues() as PostFormValues)),
      delay,
    );
  };

  const saveNow = (values?: PostFormValues) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    write(values ?? (getValues() as PostFormValues));
  };

  const tryRestore = () => {
    const d = LocalStorage.getItem<LocalDraft>(keyRef.current);
    if (!d?.values) return false;
    reset(d.values, { keepDirty: true });
    return true;
  };

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    LocalStorage.removeItem(keyRef.current);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { scheduleAutosave, saveNow, tryRestore, clear };
}
