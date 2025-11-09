import "client-only";
import { clientFetchOrThrow } from "@/lib/api/clientFetch";
import {
  PostDetailDTO,
  PostDetailDTOSchema,
} from "@/features/post/type/PostDetailDTO";

export default async function getPostDetail(slug: string) {
  return clientFetchOrThrow<PostDetailDTO>(`/api/v1/posts/${slug}`, {
    method: "GET",
    dataSchema: PostDetailDTOSchema,
  });
}
