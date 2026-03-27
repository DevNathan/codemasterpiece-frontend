"use client";

import React, { useEffect, useRef } from "react";
import DraftBanner from "@/features/post/ui/detail/element/DraftBanner";
import "katex/dist/katex.min.css";
import { useImageViewer } from "@/contexts/ImageViewProvider";
import ArticleTOC from "@/features/post/ui/detail/element/ArticleTOC";
import {
  cleanupImageFallback,
  initImageFallback,
} from "@/lib/markdown/imageFallback";
import { handleCodeBlockCopy } from "@/lib/markdown/codeBlock";
import MobileTOC from "@/features/post/ui/detail/element/MobileTOC";
import { PostTocDTO } from "@/features/post/type/PostDetailDTO";
import hljs from "highlight.js";
import { renderMathInElement } from "@/lib/markdown/renderMath";

type Props = {
  isPublished: boolean;
  parsedHtml: string | null;
  toc?: PostTocDTO[];
};

const PureMarkdownRenderer = React.memo(({ html }: { html: string | null }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const codeBlocks = containerRef.current.querySelectorAll("pre code");
    codeBlocks.forEach((block) => {
      if (block.getAttribute("data-highlighted") === "yes") return;
      hljs.highlightElement(block as HTMLElement);
    });

    renderMathInElement(containerRef.current);
  }, [html]);

  return (
    <div
      ref={containerRef}
      className="cm-markdown cm-codeblock"
      dangerouslySetInnerHTML={{
        __html: html || "<p>_작성된 내용이 없습니다._</p>",
      }}
    />
  );
});
PureMarkdownRenderer.displayName = "PureMarkdownRenderer";

const Content = ({ isPublished, parsedHtml, toc = [] }: Props) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { open } = useImageViewer();
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    initImageFallback(container);

    const handleContainerClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.tagName === "IMG") {
        const img = target as HTMLImageElement;
        openRef.current(img.src, img.alt || "Post Image");
        return;
      }

      const copyBtn = target.closest(
        ".cm-codeblock-copy-btn",
      ) as HTMLButtonElement;
      if (copyBtn) {
        handleCodeBlockCopy(copyBtn);
      }
    };

    container.addEventListener("click", handleContainerClick);

    return () => {
      container.removeEventListener("click", handleContainerClick);
      cleanupImageFallback(container);
    };
  }, []);

  return (
    <div className="w-full py-8 md:py-10">
      {!isPublished && <DraftBanner />}
      <div className="px-4 block lg:grid-cols-[minmax(0,1fr)_280px] lg:grid gap-2">
        <div ref={contentRef}>
          <PureMarkdownRenderer html={parsedHtml} />
        </div>

        {toc && toc.length > 0 && (
          <div className="hidden lg:block">
            <ArticleTOC headings={toc} />
          </div>
        )}
      </div>

      {toc && toc.length > 0 && <MobileTOC headings={toc} />}
    </div>
  );
};

export default Content;
