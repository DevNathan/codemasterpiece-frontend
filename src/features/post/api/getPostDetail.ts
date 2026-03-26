import "client-only";
import { clientFetchOrThrow } from "@/lib/api/clientFetch";
import {
  PostDetailDTO,
  PostDetailDTOSchema,
} from "@/features/post/type/PostDetailDTO";

export default async function getPostDetail(
  slug: string,
  excludeContent: boolean = false,
) {
  const qs = new URLSearchParams();
  if (excludeContent) {
    qs.append("exclude-content", "true");
  }
  const queryString = qs.toString() ? `?${qs.toString()}` : "";

  return clientFetchOrThrow<PostDetailDTO>(
    `/api/v1/posts/${slug}${queryString}`,
    {
      method: "GET",
      dataSchema: PostDetailDTOSchema,
    },
  );
}
