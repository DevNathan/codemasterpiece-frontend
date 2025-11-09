import "client-only";
import { clientFetchOrThrow } from "@/lib/api/clientFetch";
import {
  CommentPageResponse,
  CommentPageResponseSchema,
} from "@/features/comment/type/CommentPageResponse";

type Params = {
  postId: string;
  page?: number;
  size?: number;
};

export default async function getCommentPage({
  postId,
  page = 1,
  size = 5,
}: Params) {
  const qs = new URLSearchParams({
    "post-id": postId,
    page: String(page),
    size: String(size),
  }).toString();

  const query = `/api/v1/comments?${qs}`;

  return clientFetchOrThrow<CommentPageResponse>(query, {
    method: "GET",
    dataSchema: CommentPageResponseSchema,
  });
}
