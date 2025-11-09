import "server-only";
import { staticServerFetch } from "@/lib/api/staticServerFetch";

type postSitemaps = {
  slug: string;
  updatedAt: string;
};

type categorySitemaps = {
  link: string;
  lastModified: string;
};

type ResponseData = {
  categories: categorySitemaps[];
  posts: postSitemaps[];
};

export default async function getSitemaps() {
  return staticServerFetch<ResponseData>("/api/v1/sitemaps", {
    method: "GET",
    cache: "force-cache",
    next: { revalidate: 60 * 30 },
    timeoutMs: 3000,
  });
}
