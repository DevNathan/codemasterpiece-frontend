import "client-only";
import { clientFetchWithForm } from "@/lib/api/clientFetch";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { CategoryType } from "@/features/category/types/CategoryDTO";

type Params = {
  name: string;
  type: CategoryType;
  parentId?: string;
  link?: string;
  image?: File | null;
  series?: boolean;
};

/**
 * 서버 validation을 RHF로 매핑하기 위해 RHF form 인스턴스를 반드시 받는다.
 * - FormData boundary는 브라우저가 자동 처리
 * - link는 항상 toLowerCase() 보정
 */
export default async function createCategory<TForm extends FieldValues>(
  form: UseFormReturn<TForm>,
  { name, type, parentId, link, image, series }: Params,
) {
  const fd = new FormData();
  fd.append("name", name);
  fd.append("type", type);
  if (parentId) fd.append("parentId", parentId);
  if (link && link.trim() !== "") fd.append("link", link.toLowerCase());
  if (image instanceof File) fd.append("image", image);
  if (typeof series === "boolean") fd.append("series", String(series));

  return clientFetchWithForm("/api/v1/categories", {
    method: "POST",
    formData: fd,
    form,
  });
}
