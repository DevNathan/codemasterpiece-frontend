import { z } from "zod";

export const AppUserSchema = z.object({
  userId: z.string(),
  nickname: z.string(),
  role: z.enum(["AUTHOR", "USER"]),
});

export type AppUser = z.infer<typeof AppUserSchema>;