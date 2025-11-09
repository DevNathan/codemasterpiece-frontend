import { z } from "zod";

export const PostListDTOSchema = z.object({
  postId: z.string(),
  slug: z.string(),
  title: z.string(),
  categoryName: z.string(),
  headImage: z.string().nullable().optional(),
  headContent: z.string(),
  viewCount: z.number().int().nonnegative(),
  likeCount: z.number().int().nonnegative(),
  published: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  tags: z.array(z.string()),
});

export type PostListDTO = z.infer<typeof PostListDTOSchema>;
