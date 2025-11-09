import "client-only";
import {
  EntryFormValues,
  EntrySchema,
} from "@/features/guest/schemas/entrySchema";
import { clientFetch, clientFetchWithForm } from "@/lib/api/clientFetch";
import { EntryDTO, EntryDTOSchema } from "@/features/guest/types/EntryDTO";
import { Path, UseFormReturn } from "react-hook-form";

export default async function createEntry(
  form: UseFormReturn<EntryFormValues>,
  json: EntrySchema,
  fieldMap?: Record<string, Path<EntryFormValues>>,
) {
  return clientFetchWithForm<EntryDTO, EntryFormValues>("/api/v1/guestbook", {
    method: "POST",
    json,
    dataSchema: EntryDTOSchema,
    form,
    fieldMap,
  });
}
