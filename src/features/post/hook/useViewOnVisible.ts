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
  enabled: boolean;
};

/**
 * @function useViewOnVisible
 * @description 지정된 DOM 엘리먼트가 뷰포트에 노출될 때 조회수를 증가시키고 서버/로컬 캐시를 동기화하는 훅입니다.
 * React Compiler 및 exhaustive-deps 규칙을 준수하여 모든 외부 참조를 의존성 배열에 명시합니다.
 */
export function useViewOnVisible<E extends Element = HTMLElement>(
  targetRef: RefObject<E | null>,
  { postId, queryKey, threshold = 0.25, resync = "none", enabled }: Opts,
) {
  const qc = useQueryClient();
  const firedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

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
          // 요청 실패 시 무시하고 진행합니다.
        }
      },
      { root: null, threshold },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [enabled, postId, qc, queryKey, resync, targetRef, threshold]);
}
