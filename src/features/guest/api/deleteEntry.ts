import "client-only";
import type { UseFormReturn } from "react-hook-form";
import { clientFetchWithForm } from "@/lib/api/clientFetch";
import type { DeleteEntrySchema } from "@/features/guest/schemas/deleteEntrySchema";

/**
 * 방명록 삭제
 * - 서버 validation이 오면 RHF에 자동 setError/setFocus
 * - 비익명/작성자 권한이면 guestPassword 본문 제외
 */
export async function deleteEntry(
  form: UseFormReturn<DeleteEntrySchema>,
  values: DeleteEntrySchema
) {
  const body =
    values.provider === "ANON" && !values.isAuthor
      ? { guestPassword: values.guestPassword || undefined }
      : {};

  return clientFetchWithForm<void, DeleteEntrySchema>(
    `/api/v1/guestbook/${values.entryId}`,
    {
      method: "DELETE",
      json: body,
      form,
      fieldMap: { guestPassword: "guestPassword" },
    }
  );
}
