import "client-only";
import { CommentSchema } from "@/features/comment/schemas/commentSchema";
import { clientFetchOrThrow, clientFetchWithForm } from "@/lib/api/clientFetch";
import {
  CommentDTO,
  CommentDTOSchema,
} from "@/features/comment/type/CommentDTO";
import type { FieldValues, UseFormReturn } from "react-hook-form";

export default async function createComment<TForm extends FieldValues>(
  form: UseFormReturn<TForm>,
  data: CommentSchema,
) {
  return clientFetchWithForm<CommentDTO, TForm>("/api/v1/comments", {
    method: "POST",
    json: data,
    dataSchema: CommentDTOSchema,
    form,
  });
}
