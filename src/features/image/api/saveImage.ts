import "client-only";
import { clientFetchOrThrow } from "@/lib/api/clientFetch";
import { FileUploadResponse, ImageUploadResponseSchema } from "@/features/image/type/FileUploadResponse";

export default async function saveImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return clientFetchOrThrow<FileUploadResponse>("/api/v1/images", {
    method: "POST",
    formData,
    dataSchema: ImageUploadResponseSchema,
  });
}