import { MetadataRoute } from "next";
import getSitemaps from "@/features/sitemaps/getSitemaps";
import { isSuccess } from "@/lib/api/staticServerFetch";

const FRONT_DOMAIN = process.env.NEXT_PUBLIC_SERVER_DOMAIN;

/**
 * Sitemap generator
 * - `/` : 인덱스
 * - `/posts` : 전체 게시글 목록
 * - `/posts/[link]` : 카테고리별 목록
 * - `/post/[slug]` : 게시글 상세
 * - `/guest` : 방명록
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 정적 페이지
  const staticRoutes = ["", "/posts", "/guest"].map((path) => ({
    url: `${FRONT_DOMAIN}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1.0 : 0.8,
  }));

  const res = await getSitemaps();

  if (!isSuccess(res) || !res.data) {
    console.error("[sitemap] fetch failed:", res);
    return staticRoutes;
  }

  const toDate = (v?: string | null) => (v ? new Date(v) : new Date());

  const { posts, categories } = res.data!;

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((c) => c.link.length > 0)
    .map((c) => ({
      url: `${FRONT_DOMAIN}/posts/${c.link}`,
      lastModified: toDate(c.lastModified),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const postRoutes: MetadataRoute.Sitemap = posts
    .filter((p) => p.slug.length > 0)
    .map((p) => ({
      url: `${FRONT_DOMAIN}/post/${p.slug}`,
      lastModified: toDate(p.updatedAt ?? null),
      changeFrequency: "monthly",
      priority: 0.9,
    }));

  return [...staticRoutes, ...categoryRoutes, ...postRoutes];
}
