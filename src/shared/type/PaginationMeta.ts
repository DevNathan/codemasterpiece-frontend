import { z } from "zod";

export const PaginationMetaSchema = z.object({
  last: z.boolean(),
  pageStart: z.number().int().nonnegative(),
  pageEnd: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  pageSize: z.number().int().nonnegative(),
  hasPrevious: z.boolean(),
  hasNext: z.boolean(),
  currentPage: z.number().int().nonnegative(),
  first: z.boolean(),
  blockSize: z.number().int().nonnegative(),
  totalElements: z.number().int().nonnegative(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
