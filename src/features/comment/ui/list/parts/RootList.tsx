"use client";

import type { CommentDTO } from "@/features/comment/type/CommentDTO";
import CommentItem from "@/features/comment/ui/item/CommentItem";

export default function RootList({ items }: { items: CommentDTO[] }) {
  return (
    <ul className="relative space-y-6 sm:space-y-7">
      {items.map((c) => (
        <CommentItem key={c.commentId} comment={c} />
      ))}
    </ul>
  );
}
