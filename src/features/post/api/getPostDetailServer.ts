import "server-only";
import { serverFetchOrThrow } from "@/lib/api/serverFetch";
import {
  PostDetailDTO,
  PostDetailDTOSchema,
} from "@/features/post/type/PostDetailDTO";
import { getPostCache, storePostCache } from "@/shared/module/postCache";

/**
 * 오직 서버 메모리(postCache) 상태만 믿고 움직이는 직설적인 페치 로직.
 * 프레임워크의 캐시 마법은 철저히 배제한다.
 */
export default async function getPostDetailServer(slug: string) {
  // 1. 네가 온전히 통제하는 단 하나의 메모리 캐시 확인
  const cached = getPostCache(slug);
  const isCached = !!cached;

  // 2. 캐시 힛(Hit) 여부에 따른 쿼리스트링 조립
  const qs = isCached ? "?exclude-content=true" : "";

  // 3. 백엔드 타격 (Next.js의 fetch 캐싱을 무시하고 무조건 서버로 쏜다)
  const res = await serverFetchOrThrow<PostDetailDTO>(
    `/api/v1/posts/${slug}${qs}`,
    {
      method: "GET",
      dataSchema: PostDetailDTOSchema,
      cache: "no-store", // 프레임워크 레벨의 캐싱 개입 원천 차단
    },
  );

  const dto = res.data!;

  // 4. 캐시 미스면 저장, 힛이면 병합
  if (isCached) {
    dto.mainContent = cached.html;
    dto.toc = cached.toc;
  } else {
    storePostCache(slug, {
      html: dto.mainContent || "",
      toc: dto.toc || [],
    });
  }

  return dto;
}
