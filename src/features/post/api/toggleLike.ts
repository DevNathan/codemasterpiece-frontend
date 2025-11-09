import "client-only";
import { clientFetchOrThrow } from "@/lib/api/clientFetch";
import { PostLikeResultDTO, PostLikeResultDTOSchema } from "@/features/post/type/PostLikeResultDTO";

export default async function toggleLike(postId: string, nextLiked: boolean) {
  return clientFetchOrThrow<PostLikeResultDTO>("/api/v1/posts/like", {
    method: "POST",
    json: {
      postId,
      toggleLike: nextLiked,
    },
    dataSchema: PostLikeResultDTOSchema,
  });
}
