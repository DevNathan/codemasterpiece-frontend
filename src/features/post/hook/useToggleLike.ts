"use client";

import { useCallback, useRef } from "react";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import toggleLike from "@/features/post/api/toggleLike";
import type { PostDetailDTO } from "@/features/post/type/PostDetailDTO";
import type { PostLikeResultDTO } from "@/features/post/type/PostLikeResultDTO";
import type { SuccessResponse } from "@/lib/api/fetchSchema";
import { toast } from "sonner";
import { formatKoreanDateTime } from "@/lib/util/timeFormatter";

type Opts = {
  postId?: string;
  isLiked?: boolean;
  queryKey: QueryKey;
  resync?: "none" | "background";
};

export function useToggleLike({
  postId,
  isLiked = false,
  queryKey,
  resync = "none",
}: Opts) {
  const qc = useQueryClient();
  const prevRef = useRef<{ liked: boolean; likeCount: number } | null>(null);

  const mutation = useMutation<SuccessResponse<PostLikeResultDTO>, unknown>({
    mutationFn: async () => {
      if (!postId) throw new Error("postId is required");
      const nextLiked = !isLiked;
      return await toggleLike(postId, nextLiked);
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey });

      const prev = qc.getQueryData<PostDetailDTO>(queryKey);
      prevRef.current = prev
        ? { liked: prev.liked, likeCount: prev.likeCount }
        : null;

      // 낙관적 업데이트
      qc.setQueryData<PostDetailDTO>(queryKey, (curr) => {
        if (!curr) return curr as any;
        const nextLiked = !curr.liked;
        const nextCount = curr.likeCount + (nextLiked ? 1 : -1);
        return { ...curr, liked: nextLiked, likeCount: Math.max(0, nextCount) };
      });
    },
    onSuccess: (payload) => {
      const data = payload.data!;
      // 서버 확정값으로 캐시 고정
      qc.setQueryData<PostDetailDTO>(queryKey, (curr) =>
        curr ? { ...curr, liked: data.liked, likeCount: data.likeCount } : curr,
      );

      // 토스트에 서버 timestamp
      toast.success(
        data.liked ? "좋아요를 처리했습니다." : "좋아요를 취소했습니다.",
        {
          description: formatKoreanDateTime(new Date(payload.timestamp)),
          duration: 1500,
        },
      );

      // 옵션: 백그라운드만 재동기화 (UI 리셋 없음)
      if (resync === "background") {
        qc.refetchQueries({ queryKey, type: "active" });
      }
    },
    onError: () => {
      // 롤백
      if (prevRef.current) {
        qc.setQueryData<PostDetailDTO>(queryKey, (curr) =>
          curr
            ? {
                ...curr,
                liked: prevRef.current!.liked,
                likeCount: prevRef.current!.likeCount,
              }
            : curr,
        );
      }
      toast.error("오류가 발생했습니다. 나중에 다시 시도해주세요.");
    },
  });

  const onClick = useCallback(() => {
    if (!postId || mutation.isPending) return;
    mutation.mutate();
  }, [mutation, postId]);

  return { onClick, isPending: mutation.isPending };
}
