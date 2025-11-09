"use client";

import React, { useEffect, useRef, useState } from "react";
import FrontPage from "@/features/post/ui/detail/element/FrontPage";
import Content from "@/features/post/ui/detail/element/Content";
import AuthorBox from "@/features/post/ui/detail/element/AuthorBox";
import LikeAndShare from "@/features/post/ui/detail/element/LikeAndShare";
import Loading from "@/app/(main)/loading";

export type PreviewData = {
  headImage: string;
  title: string;
  headContent: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  categoryName: string;
  categoryLink: string;
  mainContent: string;
};

const PostPreviewView = ({ data }: { data: PreviewData }) => {
  // 훅은 조건부 렌더 이전에
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const actionRef = useRef<HTMLElement | null>(null);
  const noop = () => {};

  if (!mounted || !data) return <Loading />;

  const {
    title,
    headImage,
    headContent,
    viewCount,
    likeCount,
    commentCount,
    published,
    createdAt,
    categoryName,
    categoryLink,
    tags,
    mainContent,
    updatedAt,
  } = data;

  return (
    <div>
      <FrontPage
        headImage={headImage}
        title={title}
        headContent={headContent}
        viewCount={viewCount}
        likeCount={likeCount}
        commentCount={commentCount}
        isPublished={published}
        createdAt={createdAt}
        updatedAt={updatedAt}
        tags={tags}
        categoryName={categoryName}
        categoryLink={categoryLink}
      />

      <div className="max-w-[1200px] w-full mx-auto">
        <div className="relative">
          <Content isPublished={published} mainContent={mainContent} />

          <AuthorBox className="m-4" />

          <LikeAndShare
            ref={actionRef as React.RefObject<HTMLElement>}
            likeCount={likeCount}
            isLiked={false}
            handleLikeClick={noop}
            isPending={false}
          />
        </div>
      </div>
    </div>
  );
};

export default PostPreviewView;
