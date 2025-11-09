"use client";
import { useCallback, useEffect, useState } from "react";
import { LocalStorage } from "@/shared/module/localStorage";

export function usePersistedNumber(key: string, initial = 5) {
  const [value, setValue] = useState<number>(initial);
  useEffect(() => {
    const raw = LocalStorage.getItem(key);
    if (raw != null) {
      const n = parseInt(String(raw), 10);
      if (!Number.isNaN(n) && n > 0) setValue(n);
    }
  }, [key]);
  const update = useCallback(
    (n: number) => {
      setValue(n);
      LocalStorage.setItem(key, n);
    },
    [key],
  );
  return [value, update] as const;
}
