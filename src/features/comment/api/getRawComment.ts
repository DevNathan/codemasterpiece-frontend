import "client-only";
import { clientFetchOrThrow } from "@/lib/api/clientFetch";
import { z } from "zod";

type Params = {
  commentId: string;
};

export default async function getRawComment({ commentId }: Params) {
  const query = `/api/v1/comments/${commentId}/raw`;

  return clientFetchOrThrow<string>(query, {
    method: "GET",
    dataSchema: z.string(),
  });
}
