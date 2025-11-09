import { z } from "zod";

export type CategoryType = "FOLDER" | "LINK";

export type CategoryDTO = {
  categoryId: string;
  name: string;
  type: CategoryType;
  sortOrder: number;
  level: number;
  link: string | null;
  imagePath: string | null;
  children: CategoryDTO[];
};

export const CategorySchema: z.ZodType<CategoryDTO> = z.lazy(() =>
  z.object({
    categoryId: z.string(),
    name: z.string(),
    type: z.enum(["FOLDER", "LINK"]),
    sortOrder: z.number(),
    level: z.number(),
    link: z.string().nullable(),
    imagePath: z.string().nullable(),
    children: z.array(CategorySchema),
  }),
);

export const CategoryTreeSchema: z.ZodType<CategoryDTO[]> =
  z.array(CategorySchema);
