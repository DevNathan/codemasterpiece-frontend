"use client";

import { useEffect } from "react";
import { UseFormReset } from "react-hook-form";
import { PostSchema } from "@/features/post/schemas/postSchema";
import { toast } from "sonner";
import { clientFetch, isSuccess } from "@/lib/api/clientFetch";

interface Props {
  postId?: string;
  isEditMode: boolean;
  reset: UseFormReset<PostSchema & { headImagePreview?: string }>;
}

type PostEditDTO = {
  id: string;
  title: string;
  categoryId: string;
  headImage: string;
  headImageUrl: string;
  headContent: string;
  tags: string[];
  mainContent: string;
  published: boolean;
};

/**
 * 작성/수정 모드에서 초기 데이터를 로드하는 훅.
 * postId가 있으면 서버에서 데이터를 불러와 RHF 폼에 주입.
 * 스키마는 불변. UI 전용 필드(headImagePreview)만 추가 주입.
 */
export const usePostFormInit = ({ postId, isEditMode, reset }: Props) => {
  useEffect(() => {
    if (!isEditMode || !postId) return;

    const loadPostData = async () => {
      try {
        const res = await clientFetch<PostEditDTO>(`/api/v1/posts/edit/${postId}`);

        if (!isSuccess(res)) {
          return toast.error("게시글을 불러오지 못했습니다.");
        }

        const {
          title,
          categoryId,
          headImage,
          headContent,
          headImageUrl,
          tags,
          mainContent,
          published,
        } = res.data!;

        reset({
          title,
          categoryId,
          headImage,
          headContent,
          tags: tags ?? [],
          mainContent,
          published: published ?? false,
          headImagePreview: headImageUrl || "", // UI-only
        });

        toast("게시글 데이터를 불러왔습니다.");
      } catch (err) {
        console.error(err);
        toast.error("게시글 불러오기 실패");
      }
    };

    loadPostData();
  }, [isEditMode, postId, reset]);
};
