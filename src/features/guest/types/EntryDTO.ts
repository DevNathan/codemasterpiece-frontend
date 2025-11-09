import { z } from "zod";

export const EntryDTOSchema = z.object({
  entryId: z.string(),
  actorId: z.string(),
  provider: z.union([
    z.literal("GITHUB"),
    z.literal("ANON"),
  ]),
  profileImage: z.string(),
  nickname: z.string(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  author: z.boolean(),
});

export type EntryDTO = z.infer<typeof EntryDTOSchema>;
