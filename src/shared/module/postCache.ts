import "server-only";
import { PostTocDTO } from "@/features/post/type/PostDetailDTO";

/**
 * 캐시에 보관될 파싱된 게시글 데이터의 구조체입니다.
 * 본문의 HTML 문자열과 추출된 목차(TOC) 배열을 포함합니다.
 */
export type PostItem = {
  html: string;
  toc: PostTocDTO[];
};

/**
 * 파싱된 마크다운 결과를 서버 메모리에 보관하는 전역 캐시 저장소입니다.
 * 데이터베이스 I/O 및 파싱 연산 비용을 최소화하기 위해 사용됩니다.
 */
const postCache = new Map<string, PostItem>();

// 현재 환경이 개발 모드인지 판별합니다.
const isDev = process.env.NODE_ENV === "development";

/**
 * 슬러그(Slug) 기반의 키(Key)를 정규화합니다.
 * 프론트엔드 라우터에서 전달된 디코딩 문자열과 API 호출 시 전달된 인코딩 문자열을
 * 단일한 키로 식별하기 위해 강제 URI 디코딩을 수행합니다.
 *
 * @param slug 원본 슬러그 문자열
 * @return 디코딩이 완료된 순수 슬러그 문자열 (비정상적인 URI 문자열로 인해 디코딩 실패 시 원본 반환)
 */
function normalizeKey(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

/**
 * 파싱된 게시글 데이터를 캐시에 적재합니다.
 * 이미 동일한 키의 캐시가 존재할 경우 기존 데이터를 보존하고 덮어쓰지 않습니다.
 *
 * @param slug 게시글의 고유 식별자
 * @param item 캐시에 저장할 HTML 및 TOC 데이터 객체
 */
export function storePostCache(slug: string, item: PostItem): void {
  const key = normalizeKey(slug);
  if (postCache.has(key)) return;
  postCache.set(key, item);
}

/**
 * 정규화된 키를 사용하여 캐시에서 파싱된 게시글 데이터를 조회합니다.
 *
 * @param slug 게시글의 고유 식별자
 * @return 캐싱된 데이터 객체 (존재하지 않을 경우 undefined 반환)
 */
export function getPostCache(slug: string): PostItem | undefined {
  const key = normalizeKey(slug);
  return postCache.get(key);
}

/**
 * 특정 게시글의 캐시를 메모리에서 영구적으로 삭제합니다.
 * 게시글 데이터가 수정되거나 삭제될 때 호출되어 캐시의 정합성을 유지합니다.
 *
 * @param slug 무효화할 게시글의 고유 식별자
 */
export function invalidatePostCache(slug: string): void {
  const key = normalizeKey(slug);
  if (isDev) {
    console.log(`[Cache Invalidate] Target: ${slug} -> Normalized Key: ${key}`);
  }
  postCache.delete(key);
}

/**
 * 메모리에 적재된 모든 게시글 캐시를 일괄 초기화합니다.
 */
export function clearAllPostCache(): void {
  if (isDev) {
    console.log("[Cache Clear All] All caches have been cleared.");
  }
  postCache.clear();
}

/**
 * [디버깅 전용] 현재 메모리에 캐싱된 모든 키(정규화된 슬러그) 목록을 반환합니다.
 * 본 함수는 개발 환경(development)에서만 동작하며, 프로덕션 환경에서는 빈 배열을 반환합니다.
 *
 * @return 캐싱된 키 문자열 배열
 */
export function debugPostCacheKeys(): string[] {
  if (!isDev) return [];
  const keys = Array.from(postCache.keys());
  console.log(
    `[Cache Debug] Current cache keys (Total: ${keys.length}):`,
    keys,
  );
  return keys;
}
