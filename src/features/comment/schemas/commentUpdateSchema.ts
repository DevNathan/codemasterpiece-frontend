import { z } from "zod";

export const makeCommentEditFormSchema = (needPassword: boolean) =>
  z
    .object({
      content: z
        .string()
        .trim()
        .min(1, "내용은 필수입니다.")
        .max(2000, "내용은 2000자를 초과할 수 없습니다."),
      guestPassword: z
        .union([
          z.string().regex(/^\d{6}$/, "비밀번호는 숫자 6자리여야 합니다."),
          z.literal(""),
          z.undefined(),
        ])
        .transform((v) =>
          typeof v === "string" && v.trim() === "" ? undefined : v
        ),
    })
    .superRefine((val, ctx) => {
      if (needPassword && !val.guestPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["guestPassword"],
          message: "익명 글은 비밀번호가 필요합니다.",
        });
      }
    });

export type CommentEditFormValues = z.infer<
  ReturnType<typeof makeCommentEditFormSchema>
>;
