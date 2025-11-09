"use client";
import CommentSkeleton from "@/features/comment/ui/shared/CommentSkeleton";

export default function SkeletonList({
  count = 5,
  depth = 0,
}: {
  count?: number;
  depth?: number;
}) {
  return (
    <ul className="grid gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CommentSkeleton key={`cmt-skel-${i}`} depth={depth} />
      ))}
    </ul>
  );
}
