import {
  CategoryDTO,
  CategoryTreeSchema,
} from "@/features/category/types/CategoryDTO";
import { serverFetchOrThrow } from "@/lib/api/serverFetch";

export default async function getCategoryTreeServer() {
  return serverFetchOrThrow<CategoryDTO[]>("/api/v1/categories", {
    method: "GET",
    dataSchema: CategoryTreeSchema,
  });
}
