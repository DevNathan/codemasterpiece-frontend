import { z } from "zod";
import { PostListDTOSchema } from "@/features/post/type/PostListDTO";
import { PaginationMetaSchema } from "@/shared/type/PaginationMeta";

export const PostPageResponseSchema = z.object({
  content: z.array(PostListDTOSchema),
  pagination: PaginationMetaSchema,
});

export type PostPageResponse = z.infer<typeof PostPageResponseSchema>;
