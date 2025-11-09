"use client";

import React from "react";
import { PostListDTO } from "@/features/post/type/PostListDTO";
import GridCard from "@/shared/components/posts/grid/GridCard";

type Props = {
  posts: PostListDTO[];
};

const GridMode = ({ posts,  }: Props) => {
  return (
    <section className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {posts.map((p) => (
        <GridCard key={p.postId} post={p} isEventOn={true} />
      ))}
    </section>
  );
};

export default GridMode;
