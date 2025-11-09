import "client-only";
import { z } from "zod";
import { clientFetch } from "@/lib/api/clientFetch";

const CommentHideResultSchema = z.object({
  hide: z.boolean(),
});

export default async function toggleHide(
  commentId: string,
  nextHidden: boolean,
) {
  return clientFetch<z.infer<typeof CommentHideResultSchema>>(
    `/api/v1/comments/${commentId}/visibility?hidden=${nextHidden}`,
    {
      method: "PATCH",
      dataSchema: CommentHideResultSchema,
    },
  );
}
