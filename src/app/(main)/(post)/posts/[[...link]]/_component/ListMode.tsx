"use client";

import React from "react";
import { PostListDTO } from "@/features/post/type/PostListDTO";
import ListCard from "@/shared/components/posts/list/ListCard";
import { ListCardSkeleton } from "@/shared/components/posts/list/ListCardSkeleton";

type Props = {
  posts: PostListDTO[];
};

const ListMode = ({ posts }: Props) => {
  return (
    <section className="mt-6 flex flex-col divide-y divide-border/50">
      {posts.map((p) => (
        <ListCard key={p.postId} post={p} />
      ))}
    </section>
  );
};

export default ListMode;
