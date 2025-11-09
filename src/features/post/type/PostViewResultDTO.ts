import { z } from "zod";

export const PostViewResultDTOSchema = z.object({
  counted: z.boolean(),       // 이번 요청이 실제로 +1 되었는가
  viewCount: z.number().optional(), // 서버가 최신 카운트를 내려주면 사용
});

export type PostViewResultDTO = z.infer<typeof PostViewResultDTOSchema>;
