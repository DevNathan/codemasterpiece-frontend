import "client-only";
import { type FieldValues, type UseFormReturn } from "react-hook-form";
import { clientFetchWithForm } from "@/lib/api/clientFetch";
import { CommentDTO, CommentDTOSchema } from "@/features/comment/type/CommentDTO";

export type EditCommentParams = {
  commentId: string;
  content: string;
  provider: "GITHUB" | "ANON";
  isAuthor: boolean;
  guestPassword?: string;
};

export default async function editComment<TForm extends FieldValues>(
  form: UseFormReturn<TForm>,
  params: EditCommentParams,
) {
  const payload: Record<string, unknown> = {
    content: params.content,
  };

  // 익명 + (작성자 아님) + guestPassword 존재 → PIN 전송
  if (
    params.provider === "ANON" &&
    !params.isAuthor &&
    typeof params.guestPassword === "string" &&
    params.guestPassword.trim() !== ""
  ) {
    payload.guestPassword = params.guestPassword;
  }

  return clientFetchWithForm<CommentDTO, TForm>(
    `/api/v1/comments/${params.commentId}`,
    {
      method: "PATCH",
      json: payload,
      dataSchema: CommentDTOSchema,
      form,
    },
  );
}
