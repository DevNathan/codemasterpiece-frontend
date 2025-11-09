import "client-only";
import { type FieldValues, type UseFormReturn } from "react-hook-form";
import { clientFetchWithForm } from "@/lib/api/clientFetch";

export default async function deleteComment<TForm extends FieldValues>(
  form: UseFormReturn<TForm>,
  params: { commentId: string; guestPassword?: string; needPassword?: boolean },
) {
  const payload: Record<string, unknown> = {};

  // 익명 + 필요시 PIN 전송 (상위에서 needPassword 판단해서 내려줌)
  if (
    (params.needPassword ?? false) &&
    typeof params.guestPassword === "string" &&
    params.guestPassword.trim() !== ""
  ) {
    payload.guestPassword = params.guestPassword;
  }

  return clientFetchWithForm<unknown, TForm>(
    `/api/v1/comments/${params.commentId}`,
    {
      method: "DELETE",
      json: payload,
      form,
    },
  );
}
