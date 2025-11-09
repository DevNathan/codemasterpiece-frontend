// useViewOnVisible.ts
"use client";

import { RefObject, useEffect, useRef } from "react";
import { QueryKey, useQueryClient } from "@tanstack/react-query";
import increaseViewCount from "@/features/post/api/increaseViewCount";
import type { PostDetailDTO } from "@/features/post/type/PostDetailDTO";

type Opts = {
  postId: string;
  queryKey: QueryKey;
  threshold?: number;
  resync?: "none" | "background";
};

/** target 엘리먼트가 보이면 조회수 증가 + 캐시 반영 (+선택적 백그라운드 동기화) */
export function useViewOnVisible<E extends Element = HTMLElement>(
  targetRef: RefObject<E | null>,
  { postId, queryKey, threshold = 0.25, resync = "none" }: Opts,
) {
  const qc = useQueryClient();
  const firedRef = useRef(false);

  useEffect(() => {
    const el = targetRef.current;
    if (!el || !postId) return;

    const io = new IntersectionObserver(
      async (entries) => {
        const visible = entries.some(
          (e) => e.isIntersecting && e.intersectionRatio > 0,
        );
        if (!visible || firedRef.current) return;

        firedRef.current = true;

        try {
          const res = await increaseViewCount(postId);
          const counted = res.data?.counted === true;
          const serverCount = res.data?.viewCount;

          if (counted) {
            qc.setQueryData<PostDetailDTO>(queryKey, (curr) => {
              if (!curr) return curr as any;
              const next = serverCount ?? curr.viewCount + 1;
              return { ...curr, viewCount: Math.max(next, 0) };
            });

            if (resync === "background") {
              await qc.refetchQueries({ queryKey, type: "active" });
            }
          }
        } catch {
          // 무시
        }
      },
      { root: null, threshold },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [postId, queryKey, threshold, resync, qc, targetRef]);
}
