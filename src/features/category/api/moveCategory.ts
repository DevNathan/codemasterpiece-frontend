"use client";
import "client-only";
import { clientFetch } from "@/lib/api/clientFetch";

export type MoveCategoryPayload = {
  categoryId: string;
  newParentId: string | null;
  newIndex: number | null;
  beforeId: string | null;
  afterId: string | null;
};

export async function moveCategory(body: MoveCategoryPayload) {
  return clientFetch("/api/v1/categories/move", {
    method: "PATCH",
    json: body,
  });
}
