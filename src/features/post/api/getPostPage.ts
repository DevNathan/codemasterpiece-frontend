import { clientFetchOrThrow } from "@/lib/api/clientFetch";
import {
  PostPageResponse,
  PostPageResponseSchema,
} from "@/features/post/type/PostPageResponse";

type Params = {
  page?: number;
  size?: number;
  sortKey?: "createdAt" | "updatedAt" | "title" | "viewCount" | "likeCount";
  sortDir?: "ASC" | "DESC";
  link?: string | null;
  elevated?: boolean;
  keyword?: string | null;
};

export default async function getPostPage({
  page = 1,
  size = 12,
  sortKey = "createdAt",
  sortDir = "DESC",
  link = null,
  keyword = null,
}: Params = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort: `${sortKey},${sortDir}`,
  });

  if (link) params.append("link", link);
  if (keyword) params.append("keyword", keyword);

  const query = `/api/v1/posts?${params.toString()}`;

  return clientFetchOrThrow<PostPageResponse>(query, {
    method: "GET",
    dataSchema: PostPageResponseSchema,
  });
}
