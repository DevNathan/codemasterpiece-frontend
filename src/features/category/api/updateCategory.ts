import "client-only";
import { clientFetch, clientFetchWithForm } from "@/lib/api/clientFetch";
import type { FieldValues, UseFormReturn } from "react-hook-form";

type UpdateCategoryParams = {
  name?: string | null;
  link?: string | null; // FOLDER면 값 보내지 말 것
  image?: File | null; // 새 이미지(없으면 넣지 말기)
  removeImage?: boolean; // true면 image 무시하고 삭제
};

/**
 * 카테고리 업데이트 (multipart/form-data)
 * - 존재하는 필드만 전송
 * - boolean은 "true"/"false" 문자열로 전송
 * - image와 removeImage가 동시에 오면 removeImage 우선
 */
export default async function updateCategory<TForm extends FieldValues>(
  form: UseFormReturn<TForm>,
  categoryId: string,
  params: UpdateCategoryParams,
) {
  const fd = new FormData();

  // 문자열 필드: null/undefined/빈문자열은 제외
  if (params.name && params.name.trim().length > 0) {
    fd.append("name", params.name.trim());
  }
  if (params.link && params.link.trim().length > 0) {
    fd.append("link", params.link.trim());
  }

  // 이미지 삭제 플래그 (항상 명시적으로 내려보내고 싶으면 아래 if 제거)
  if (typeof params.removeImage === "boolean") {
    fd.append("removeImage", String(params.removeImage)); // "true"/"false"
  }

  // 이미지 교체: removeImage=true면 무시
  if (!params.removeImage && params.image instanceof File) {
    fd.append("image", params.image);
  }

  return clientFetchWithForm(`/api/v1/categories/${categoryId}`, {
    method: "PATCH",
    formData: fd,
    form,
  });
}
