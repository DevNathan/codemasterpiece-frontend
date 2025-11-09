"use client";

import React, { useMemo } from "react";
import CommentForm from "@/features/comment/ui/form/CommentForm";
import { CommentProvider } from "@/features/comment/context/CommentContext";
import { useInViewOnce } from "@/shared/hooks/useInViewOnce";
import { LOCALS } from "@/lib/constants/localstorages";
import { LocalStorage } from "@/shared/module/localStorage";
import CommentList from "@/features/comment/ui/list/CommentList";

type Props = { postId: string };

const DEFAULT_SIZE = 5;

const clampSize = (n: number) => Math.max(1, Math.min(50, n));

const CommentSection = ({ postId }: Props) => {
  const { ref: visibleRef, inView: visible } = useInViewOnce({
    rootMargin: "0px",
    threshold: 0.1,
  });

  const preferredSize = useMemo(() => {
    const raw = LocalStorage.getItem<number | string>(LOCALS.PREFER_C_SIZE);
    if (raw == null) return DEFAULT_SIZE;

    const n =
      typeof raw === "number"
        ? raw
        : Number.isNaN(parseInt(String(raw), 10))
          ? DEFAULT_SIZE
          : parseInt(String(raw), 10);

    return clampSize(n);
  }, []);

  return (
    <div ref={visibleRef as React.RefObject<HTMLDivElement>}>
      <CommentProvider
        postId={postId}
        initialSize={preferredSize}
        enabled={visible}
      >
        <section className="w-full my-6 px-2" aria-label="댓글">
          <h5 className="text-4xl font-semibold mb-12">Comments</h5>
          <CommentForm />
          <CommentList />
        </section>
      </CommentProvider>
    </div>
  );
};

export default CommentSection;
