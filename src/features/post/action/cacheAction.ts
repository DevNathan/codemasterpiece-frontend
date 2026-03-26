"use server";

import {
  debugPostCacheKeys,
  invalidatePostCache,
  clearAllPostCache,
} from "@/shared/module/postCache";

/**
 * 특정 슬러그의 게시글 캐시를 무효화합니다.
 */
export async function invalidatePostCacheAction(slug: string) {
  debugPostCacheKeys();
  invalidatePostCache(slug);
}

/**
 * 서버 메모리에 적재된 모든 게시글 캐시를 즉시 초기화합니다.
 */
export async function clearAllCacheAction() {
  clearAllPostCache();
}
