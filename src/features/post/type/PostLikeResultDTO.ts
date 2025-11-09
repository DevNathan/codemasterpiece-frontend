import { z } from "zod";

export const PostLikeResultDTOSchema = z.object({
  liked: z.boolean(),
  likeCount: z.number(),
});

export type PostLikeResultDTO = z.infer<typeof PostLikeResultDTOSchema>;