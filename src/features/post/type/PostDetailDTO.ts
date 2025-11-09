import { z } from "zod";
import { PostListDTOSchema } from "@/features/post/type/PostListDTO";

export const PostDetailDTOSchema = z.object({
  postId: z.string(),
  slug: z.string(),
  title: z.string(),
  headImage: z.string(),
  headContent: z.string(),
  categoryName: z.string(),
  categoryLink: z.string(),
  mainContent: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  published: z.boolean(),

  viewCount: z.number().int().nonnegative(),
  likeCount: z.number().int().nonnegative(),
  commentCount: z.number().int().nonnegative(),

  liked: z.boolean(),

  tags: z.array(z.string()),
  morePosts: z.array(PostListDTOSchema).default([]),
});

export type PostDetailDTO = z.infer<typeof PostDetailDTOSchema>;
