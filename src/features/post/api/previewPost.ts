import "client-only";
import { clientFetch } from "@/lib/api/clientFetch";
import { PostTocDTO } from "@/features/post/type/PostDetailDTO";

type Response = {
  html: string;
  toc: PostTocDTO[];
};

export default async function previewPost(markdown: string) {
  return clientFetch<Response>(`/api/v1/posts/preview`, {
    json: { content: markdown },
    method: "POST",
  });
}
