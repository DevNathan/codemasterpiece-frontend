"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PostPreviewView, { PreviewData } from "./PostPreviewView";
import Loading from "@/app/(main)/loading";
import { LocalStorage } from "@/shared/module/localStorage";

const PostPreviewPage = () => {
  const [data, setData] = useState<PreviewData | null>(null);
  const params = useSearchParams();

  useEffect(() => {
    const key = params.get("key");        // 예: preview-post-<uuid>
    const chanName = params.get("chan");  // 예: preview-chan-<uuid>
    if (!key) return;

    // 1) 초기 1회 로드(LocalStorage 래퍼)
    try {
      const initial = LocalStorage.getItem<PreviewData>(key);
      if (initial) setData(initial);
    } catch {}

    // 2) BroadcastChannel 실시간 구독
    let chan: BroadcastChannel | null = null;
    if (chanName && "BroadcastChannel" in window) {
      try {
        chan = new BroadcastChannel(chanName);
        chan.onmessage = (evt) => {
          if (evt?.data?.type === "snapshot") {
            setData(evt.data.payload as PreviewData);
          }
        };
      } catch {
        chan = null;
      }
    }

    // 3) storage 이벤트 폴백
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.endsWith(key)) {
        const next = LocalStorage.getItem<PreviewData>(key);
        if (next) setData(next);
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      if (chan) { try { chan.close(); } catch {} }
    };
  }, [params]);

  if (!data) return <Loading />;
  return <PostPreviewView data={data} />;
};

export default PostPreviewPage;
