"use client";

import { clientFetchOrThrow } from "@/lib/api/clientFetch";
import { makeSliceSchema, SliceOfSchema } from "@/shared/type/SliceSchema";
import { EntryDTOSchema } from "@/features/guest/types/EntryDTO";

const GuestbookSliceSchema = makeSliceSchema(EntryDTOSchema);
type GuestbookSlice = SliceOfSchema<typeof EntryDTOSchema>;

export async function getEntrySlice(cursor?: string, size = 20) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (size) params.set("size", String(size));

  const qs = params.toString();
  const url = qs ? `/api/v1/guestbook?${qs}` : "/api/v1/guestbook";

  return clientFetchOrThrow<GuestbookSlice>(url, {
    method: "GET",
    dataSchema: GuestbookSliceSchema,
  });
}
