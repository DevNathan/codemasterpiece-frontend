import "client-only";
import { clientFetch } from "@/lib/api/clientFetch";

export default async function deleteCategory(categoryId: string) {
  return clientFetch<void>(`/api/v1/categories/${categoryId}`, {
    method: "DELETE",
  });
}
