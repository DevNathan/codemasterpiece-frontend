import { clientFetchOrThrow, clientFetchWithForm } from "@/lib/api/clientFetch";
import { PostSchema } from "@/features/post/schemas/postSchema";
import type { FieldValues, UseFormReturn } from "react-hook-form";

export default async function createPost<TForm extends FieldValues>(
  form: UseFormReturn<TForm>,
  data: PostSchema,
) {
  return await clientFetchWithForm<string, TForm>("/api/v1/posts", {
    method: "POST",
    json: data,
    form,
  });
}
