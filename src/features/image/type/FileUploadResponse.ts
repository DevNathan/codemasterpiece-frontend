import { z } from "zod";

export const ImageUploadResponseSchema = z.object({
  fileId: z.string(),
  url: z.string(),
  contentType: z.string(),
  byteSize: z.number(),
});

export type FileUploadResponse = z.infer<typeof ImageUploadResponseSchema>;
