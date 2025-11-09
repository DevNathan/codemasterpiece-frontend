import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "이름은 2자 이상 입력해야합니다.")
    .max(20, "이름은 20자를 초과할 수 없습니다.")
    .regex(/^\S+$/, "이름은 공백 없이 입력해주세요."),
  link: z
    .string()
    .regex(/^[a-z-]+$/, "링크는 소문자, 숫자, 하이픈만 사용 가능합니다."),
  image: z
    .any()
    .nullable()
    .refine(
      (file) =>
        !file || (file instanceof File && file.type === "image/svg+xml"),
      "SVG 파일만 가능합니다.",
    ),
});

export type CategorySchema = z.infer<typeof categorySchema>;
