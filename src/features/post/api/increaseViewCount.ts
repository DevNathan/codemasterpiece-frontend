import "client-only";
import { clientFetchOrThrow } from "@/lib/api/clientFetch";
import {
  PostViewResultDTO,
  PostViewResultDTOSchema,
} from "@/features/post/type/PostViewResultDTO";

export default async function increaseViewCount(postId: string) {
  return clientFetchOrThrow<PostViewResultDTO>("/api/v1/posts/view", {
    method: "POST",
    json: { postId },
    dataSchema: PostViewResultDTOSchema,
  });
}
