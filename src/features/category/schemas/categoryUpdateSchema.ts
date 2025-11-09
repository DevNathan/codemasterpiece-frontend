// features/category/schemas/categoryUpdateSchema.ts
import { z } from "zod";

/** 빈 문자열을 undefined로 정규화 */
const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([z.literal(""), schema]).transform((v) => (v === "" ? undefined : v));

export const categoryUpdateSchema = z
  .object({
    // 이름: 빈 값이면 전송 안 함(=undefined). 값이 있으면 검증.
    name: emptyToUndefined(
      z
        .string()
        .min(2, "이름은 2자 이상 입력해야합니다.")
        .max(20, "이름은 20자를 초과할 수 없습니다.")
        .regex(/^\S+$/, "이름은 공백 없이 입력해주세요."),
    ).optional(),

    // 링크: 빈 값이면 undefined, 값이 있으면 소문자 변환 + 패턴 검증
    link: emptyToUndefined(
      z.string().regex(/^[a-z-]+$/, "링크는 소문자, 하이픈만 사용 가능합니다."),
    )
      .nullable()
      .optional(),

    // 이미지: 파일 또는 null. (업데이트 폼은 image/* 허용)
    image: z.union([z.instanceof(File), z.null()]).optional(),

    // 이미지 삭제 플래그
    removeImage: z.boolean().default(false).optional(),
  })
  .superRefine((val, ctx) => {
    // 삭제 체크가 켜지면 image는 반드시 null이어야 함
    if (val.removeImage && val.image) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["image"],
        message:
          "이미지 삭제가 선택되어 있으면 새 이미지를 업로드할 수 없습니다.",
      });
    }
  });

export type CategoryUpdateSchema = z.infer<typeof categoryUpdateSchema>;
