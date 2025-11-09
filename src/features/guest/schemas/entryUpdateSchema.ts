import { z } from "zod";

export const editEntrySchema = z
  .object({
    entryId: z.string(),
    content: z
      .string()
      .trim()
      .min(1, "내용은 필수입니다.")
      .max(2000, "내용은 2000자를 초과할 수 없습니다."),
    provider: z.enum(["GITHUB", "ANON"]),
    isAuthor: z.boolean(),
    guestPassword: z
      .union([
        z.string().regex(/^\d{6}$/, "비밀번호는 숫자 6자리여야 합니다."),
        z.literal(""),
        z.undefined(),
      ])
      .transform((v) =>
        typeof v === "string" && v.trim() === "" ? undefined : v,
      ),
  })
  .superRefine((val, ctx) => {
    if (val.provider === "ANON" && !val.isAuthor) {
      if (!val.guestPassword || val.guestPassword.trim().length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["guestPassword"],
          message: "익명 글은 비밀번호가 필요합니다.",
        });
      }
    }
  });

export type EditEntrySchema = z.infer<typeof editEntrySchema>;
