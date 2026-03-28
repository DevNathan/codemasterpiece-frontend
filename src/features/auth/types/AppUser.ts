import { z } from "zod";

export const AppUserSchema = z.object({
  userId: z.string(),
  avatarUrl: z.string(),
  avatarUrlSmall: z.string(),
  nickname: z.string(),
  role: z.enum(["AUTHOR", "USER"]),
  provider: z.enum(["GITHUB", "GITLAB", "ANON"]),
});

export type AppUser = z.infer<typeof AppUserSchema>;
