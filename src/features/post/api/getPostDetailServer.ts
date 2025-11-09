import "server-only";
import { serverFetchOrThrow } from "@/lib/api/serverFetch";
import {
  PostDetailDTO,
  PostDetailDTOSchema,
} from "@/features/post/type/PostDetailDTO";

export default async function getPostDetailServer(slug: string) {
  return serverFetchOrThrow<PostDetailDTO>(`/api/v1/posts/${slug}`, {
    method: "GET",
    dataSchema: PostDetailDTOSchema,
  });
}
