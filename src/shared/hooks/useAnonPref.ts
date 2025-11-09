"use client";
import { useState } from "react";
import { LocalStorage } from "@/shared/module/localStorage";
import { LOCALS } from "@/lib/constants/localstorages";

export type AnonPref = { name: string; avatarIndex: number };

export function useAnonPref(avatarCount: number) {
  const [pref, setPref] = useState<AnonPref>(() => {
    const raw = LocalStorage.getItem<AnonPref | string>(LOCALS.ANON_COMMENT);
    if (!raw) return { name: "", avatarIndex: 0 };
    if (typeof raw === "string") return { name: raw, avatarIndex: 0 };
    const idx = Number.isFinite(raw.avatarIndex) ? raw.avatarIndex : 0;
    return {
      name: raw.name ?? "",
      avatarIndex: Math.max(0, Math.min(idx, avatarCount - 1)),
    };
  });

  const save = (next: AnonPref) => {
    setPref(next);
    LocalStorage.setItem<AnonPref>(LOCALS.ANON_COMMENT, next);
  };

  return [pref, save] as const;
}
