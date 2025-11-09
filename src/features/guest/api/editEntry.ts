import "client-only";
import { type FieldValues, type UseFormReturn } from "react-hook-form";
import { clientFetchWithForm } from "@/lib/api/clientFetch";
import { EntryDTO, EntryDTOSchema } from "@/features/guest/types/EntryDTO";
import { EditEntrySchema } from "@/features/guest/schemas/entryUpdateSchema";

/**
 * 방명록 엔트리 수정 API (RHF 통합)
 * - 서버 validation 에러는 RHF setError로 매핑 (토스트 X)
 * - 그 외 에러만 상위에서 토스트 처리
 */
export default async function editEntry<TForm extends FieldValues>(
  form: UseFormReturn<TForm>,
  params: EditEntrySchema,
) {
  const payload: Record<string, unknown> = { content: params.content };
  if (params.provider === "ANON" && !params.isAuthor && params.guestPassword) {
    payload.guestPassword = params.guestPassword;
  }

  return clientFetchWithForm<EntryDTO, TForm>(`/api/v1/guestbook/${params.entryId}`, {
    method: "PATCH",
    json: payload,
    dataSchema: EntryDTOSchema,
    form,
  });
}