import { z } from "zod";

export const deleteEntrySchema = z
  .object({
    entryId: z.string(),
    isAuthor: z.boolean(),
    provider: z.enum(["GITHUB", "ANON"]),
    guestPassword: z
      .union([
        z.string().regex(/^\d{6}$/, "guestPin은 숫자 6자리여야 합니다."),
        z.literal(""),
        z.undefined(),
      ])
      .transform((v) =>
        typeof v === "string" && v.trim() === "" ? undefined : v,
      ),
  })
  .superRefine((val, ctx) => {
    if (val.provider === "ANON" && !val.isAuthor && !val.guestPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["guestPassword"],
        message: "익명 글 삭제는 비밀번호가 필요합니다.",
      });
    }
  });

export type DeleteEntrySchema = z.infer<typeof deleteEntrySchema>;
