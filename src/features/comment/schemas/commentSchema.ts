import { z } from "zod";

/** 공통 */
const baseCommentSchema = z.object({
  postId: z.string().trim().length(29, "postId 길이가 올바르지 않습니다."),
  content: z
    .string()
    .trim()
    .min(1, "내용은 필수입니다.")
    .max(2000, "내용은 2000자를 초과할 수 없습니다."),

  parentId: z
    .union([
      z.string().trim().length(29, "parentId 길이가 올바르지 않습니다."),
      z.literal(""),
      z.undefined(),
    ])
    .transform((v) =>
      typeof v === "string" && v.trim().length > 0 ? v.trim() : undefined,
    ),

  // --- ANON 전용 필드들(빈문자 → undefined 정규화) ---
  guestDisplayName: z
    .union([
      z
        .string()
        .trim()
        .max(10, "닉네임은 10자를 초과할 수 없습니다."),
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
      z.string().regex(/^\d{6}$/, "비밀번호는 숫자 6자리여야 합니다."),
      z.literal(""),
      z.undefined(),
    ])
    .transform((v) =>
      typeof v === "string" && v.trim() === "" ? undefined : v,
    ),
});

export type BaseCommentSchema = z.infer<typeof baseCommentSchema>;

/** provider 분기: GITHUB는 guest* 무시, ANON은 guest* 전부 필수 */
export const makeCommentSchema = (provider: "ANON" | "GITHUB") =>
  baseCommentSchema.superRefine((val, ctx) => {
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

export type CommentSchema = z.infer<ReturnType<typeof makeCommentSchema>>;
