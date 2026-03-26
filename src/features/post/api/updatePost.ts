import "client-only";
import { clientFetchWithForm } from "@/lib/api/clientFetch";
import type { FieldValues, UseFormReturn } from "react-hook-form";

type UpdatePostRequest = {
  title: string;
  headImage: string | null;
  headContent: string | null;
  tags: string[];
  categoryId: string;
  mainContent: string;
  published: boolean;
};

export default async function updatePost<TForm extends FieldValues>(
  form: UseFormReturn<TForm>,
  postId: string,
  body: UpdatePostRequest,
) {
  return clientFetchWithForm<{ slug: string }, TForm>(
    `/api/v1/posts/${encodeURIComponent(postId)}`,
    {
      method: "PUT",
      json: body,
      form,
    },
  );
}
