import "client-only";
import { clientFetch } from "@/lib/api/clientFetch";

export default async function deletePost(postId: string) {
  return clientFetch(`/api/v1/posts/${postId}`, {
    method: "DELETE",
  });
}
