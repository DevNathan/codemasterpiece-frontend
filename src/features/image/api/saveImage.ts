import "client-only";
import { clientFetchOrThrow } from "@/lib/api/clientFetch";
import {
  FileUploadResponse,
  ImageUploadResponseSchema,
} from "@/features/image/type/FileUploadResponse";

/**
 * 백엔드 VariantPreset 규격과 완벽하게 동기화된 타입.
 * 서버가 허용하지 않는 문자열은 컴파일 단계에서 차단한다.
 */
type ImageVariantPreset =
  | "BLOG_DEFAULT"
  | "AVATAR"
  | "ICON"
  | "BANNER"
  | "DEFAULT";

/**
 * 서버로 이미지를 업로드하고 지정된 프리셋에 따라 비동기 변환 처리를 지시한다.
 * * @param file 업로드할 이미지 파일 객체
 * @param file 파일
 * @param preset 비동기 변환 타겟 (기본값: DEFAULT)
 */
export default async function saveImage(
  file: File,
  preset: ImageVariantPreset = "DEFAULT",
) {
  const formData = new FormData();
  formData.append("file", file);

  const url = `/api/v1/images?preset=${preset}`;

  return clientFetchOrThrow<FileUploadResponse>(url, {
    method: "POST",
    formData,
    dataSchema: ImageUploadResponseSchema,
  });
}
