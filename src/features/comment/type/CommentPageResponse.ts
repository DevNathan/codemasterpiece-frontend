import { z } from "zod";
import { PaginationMetaSchema } from "@/shared/type/PaginationMeta";
import { CommentDTOSchema } from "@/features/comment/type/CommentDTO";

export const CommentPageResponseSchema = z.object({
  content: z.array(CommentDTOSchema),
  pagination: PaginationMetaSchema,
});

export type CommentPageResponse = z.infer<typeof CommentPageResponseSchema>;
