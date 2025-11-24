import React from "react";
import { PostListDTO } from "@/features/post/type/PostListDTO";
import GridCard from "@/shared/components/posts/grid/GridCard";

type Props = {
  morePosts: PostListDTO[];
};

const MoreContentSection = ({ morePosts }: Props) => {
  return (
    <section className="w-full py-10  md:px-8 lg:px-16 bg-background">
      <div className="text-center mb-8">
        <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
          다른 게시글도 살펴보세요!
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          혹시 도움이 될지도 모르잖아요..?
        </p>
      </div>
      <div className="min-h-[120px] flex flex-col items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {morePosts?.map((post) => (
            <GridCard key={post.postId} post={post} isEventOn={false} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoreContentSection;
