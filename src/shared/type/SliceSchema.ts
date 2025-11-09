import { z } from "zod";

export const makeSliceSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    content: z.array(itemSchema),
    size: z.number().int().positive(),
    first: z.boolean(),
    last: z.boolean(),
    hasNext: z.boolean(),
    nextCursor: z.string().nullable().optional(),
  });

export type SliceOfSchema<T extends z.ZodTypeAny> = z.infer<ReturnType<typeof makeSliceSchema<T>>>;
