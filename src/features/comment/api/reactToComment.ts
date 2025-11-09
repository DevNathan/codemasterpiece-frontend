"use client";

import { clientFetch } from "@/lib/api/clientFetch";
import { z } from "zod";

export type CommentReaction = "UPVOTE" | "DOWNVOTE" | null;

const CommentReactionResultSchema = z.object({
  myReaction: z.union([z.literal("UPVOTE"), z.literal("DOWNVOTE"), z.null()]),
});

export async function reactToComment(params: {
  commentId: string;
  value: CommentReaction; // "UPVOTE" | "DOWNVOTE" | null
}) {
  const { commentId, value } = params;

  const query = value ? `?value=${encodeURIComponent(value)}` : "";

  return clientFetch<{ myReaction: CommentReaction }>(
    `/api/v1/comments/${commentId}/reaction${query}`,
    {
      method: "POST",
      dataSchema: CommentReactionResultSchema,
    },
  );
}
