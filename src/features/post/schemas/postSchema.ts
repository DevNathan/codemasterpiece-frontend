import { z } from "zod";

export const postSchema = z.object({
  title: z
    .string()
    .min(1, { error: "제목을 입력해주세요." })
    .max(200, { error: "제목은 최대 200자까지 입력할 수 있습니다." }),

  categoryId: z
    .string()
    .min(1, { error: "카테고리를 선택해주세요." }),

  headImage: z
    .string()
    .min(1, { error: "이미지 배너를 선택해주세요." }),

  headContent: z
    .string()
    .min(1, { error: "짧은 글을 작성해주세요." }),

  tags: z
    .array(z.string().min(1, { error: "태그는 비어있을 수 없습니다." }))
    .max(6, { error: "태그는 최대 6개까지 입력할 수 있습니다." }),

  mainContent: z
    .string()
    .min(1, { error: "글을 작성해주세요." }),

  published: z.boolean(),

  // quizzes: z
  //   .array(
  //     z.object({
  //       question: z.string().min(1, "퀴즈 문제를 입력해주세요."),
  //       choices: z
  //         .array(z.string().min(1, "선택지를 입력해주세요."))
  //         .length(5, "선택지는 정확히 5개여야 합니다."),
  //       correctIndex: z
  //         .number()
  //         .min(0, "정답 인덱스는 0 이상이어야 합니다.")
  //         .max(4, "정답 인덱스는 4 이하여야 합니다."),
  //       rewardPoint: z
  //         .number()
  //         .min(1, "리워드 포인트는 최소 1 이상이어야 합니다."),
  //     })
  //   )
  //   .optional(),
});

export type PostSchema = z.infer<typeof postSchema>;
