import { z } from "zod";

export const folderSchema = z.object({
  name: z
    .string()
    .min(2, "최소 2자 이상")
    .max(20, "최대 20자")
    .regex(/^\S+$/, "공백 없이 입력해주세요."),
});

export type FolderSchema = z.infer<typeof folderSchema>;