import { clientFetchOrThrow } from "@/lib/api/clientFetch";
import {
  CategoryDTO,
  CategoryTreeSchema,
} from "@/features/category/types/CategoryDTO";

export default async function getCategoryTree() {
  return clientFetchOrThrow<CategoryDTO[]>("/api/v1/categories", {
    method: "GET",
    dataSchema: CategoryTreeSchema,
  });
}
