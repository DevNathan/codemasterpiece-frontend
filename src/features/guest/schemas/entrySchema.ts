import { z } from "zod";

const baseEntrySchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "내용은 필수입니다.")
    .max(2000, "내용은 2000자를 초과할 수 없습니다."),

  guestDisplayName: z
    .union([
      z
        .string()
        .trim()
        .max(10, "guestDisplayName은 10자를 초과할 수 없습니다."),
      z.literal(""),
      z.undefined(),
    ])
    .transform((v) =>
      typeof v === "string" && v.trim() === "" ? undefined : v,
    ),

  guestImageUrl: z
    .union([
      z.string().trim().url("guestImageUrl는 올바른 URL이어야 합니다."),
      z.literal(""),
      z.undefined(),
    ])
    .transform((v) =>
      typeof v === "string" && v.trim() === "" ? undefined : v,
    ),

  guestPin: z
    .union([
      z.string().regex(/^\d{6}$/, "guestPin은 숫자 6자리여야 합니다."),
      z.literal(""),
      z.undefined(),
    ])
    .transform((v) =>
      typeof v === "string" && v.trim() === "" ? undefined : v,
    ),
});

export const makeEntrySchema = (provider: "ANON" | "GITHUB") =>
  baseEntrySchema.superRefine((val, ctx) => {
    if (provider === "ANON") {
      if (!val.guestImageUrl) {
        ctx.addIssue({
          path: ["guestImageUrl"],
          code: "custom",
          message: "프로필 이미지를 선택하세요.",
        });
      }
      if (!val.guestDisplayName) {
        ctx.addIssue({
          path: ["guestDisplayName"],
          code: "custom",
          message: "게스트 닉네임은 필수입니다.",
        });
      }
      if (!val.guestPin) {
        ctx.addIssue({
          path: ["guestPin"],
          code: "custom",
          message: "게스트 PIN은 필수입니다.",
        });
      }
    }
  });

export type EntryFormValues = z.input<ReturnType<typeof makeEntrySchema>>;

export type EntrySchema = z.output<ReturnType<typeof makeEntrySchema>>;
