"use client";

import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import PostMarkdownRenderer from "@/shared/components/markdown/PostMarkdownRenderer";
import {
  HeadingMeta,
  HeadingProvider,
} from "@/shared/components/markdown/HeadingContext";
import ArticleTOC from "@/features/post/ui/detail/element/ArticleTOC";
import DraftBanner from "@/features/post/ui/detail/element/DraftBanner";
import MobileTOC from "@/features/post/ui/detail/element/MobileTOC";
import { slugifyId } from "@/lib/util/slugify";
import remarkInlineFormats from "@/shared/components/markdown/remarkInlineFormats";

type Props = { isPublished: boolean; mainContent: string };

const Content = ({ isPublished, mainContent }: Props) => {
  const contentKey = useMemo(() => hash(mainContent || ""), [mainContent]);
  return (
    <ContentInner
      key={contentKey}
      isPublished={isPublished}
      mainContent={mainContent}
    />
  );
};

function ContentInner({ isPublished, mainContent }: Props) {
  const [headings, setHeadings] = useState<HeadingMeta[]>([]);

  const idCounts = useMemo(() => new Map<string, number>(), []);
  const seen = useMemo(() => new Set<string>(), []);

  const ctxValue = useMemo(
    () => ({
      allocId: (txt: string) => {
        const base = slugifyId(txt || "");
        const n = (idCounts.get(base) ?? 0) + 1;
        idCounts.set(base, n);
        return n === 1 ? base : `${base}-${n}`;
      },
      register: (h: HeadingMeta) => {
        if (!h.id || !h.text) return;
        const k = `${h.depth}:${h.id}`;
        if (seen.has(k)) return;
        seen.add(k);
        setHeadings((prev) => [...prev, h]);
      },
    }),
    [idCounts, seen],
  );

  // <br> 태그만 "강제 개행" 규칙에 맞게 변환
  // 두 공백 + 개행 = 하드 브레이크
  const normalizedContent = useMemo(
    () => (mainContent || "").replace(/<br\s*\/?>/gi, "  \n"),
    [mainContent],
  );

  return (
    <div className="w-full py-8 md:py-10">
      {!isPublished && <DraftBanner />}

      <MobileTOC headings={headings} />

      <div className="px-4 block lg:grid-cols-[minmax(0,1fr)_280px] lg:grid gap-2">
        <div id="post-content">
          <HeadingProvider value={ctxValue}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkInlineFormats]}
              rehypePlugins={[rehypeRaw]}
              components={PostMarkdownRenderer}
            >
              {normalizedContent || "_작성된 내용이 없습니다._"}
            </ReactMarkdown>
          </HeadingProvider>
        </div>

        <div className="hidden lg:block">
          <ArticleTOC
            headings={headings}
            className="sticky top-16"
            stickyOffset={100}
          />
        </div>
      </div>
    </div>
  );
}

export default Content;

function hash(s: string) {
  return Array.from(s)
    .reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)
    .toString();
}
