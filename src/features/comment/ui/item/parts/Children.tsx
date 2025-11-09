"use client";

import { CommentDTO } from "@/features/comment/type/CommentDTO";
import CommentItem from "@/features/comment/ui/item/CommentItem";

type Props = {
  items: CommentDTO[];
};

export default function Children({ items }: Props) {
  if (!items?.length) return null;

  return (
    <ul className="mt-4 ml-4 border-l border-border space-y-3 gap-4">
      {items.map((child) => (
        <CommentItem key={child.commentId} comment={child} />
      ))}
    </ul>
  );
}
