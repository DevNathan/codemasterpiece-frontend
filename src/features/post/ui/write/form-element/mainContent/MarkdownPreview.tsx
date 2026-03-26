"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  cleanupImageFallback,
  initImageFallback,
} from "@/lib/markdown/imageFallback";
import previewPost from "@/features/post/api/previewPost";
import { isSuccess } from "@/lib/api/clientFetch";
import { renderMathInElement } from "@/lib/markdown/renderMath";
import { handleCodeBlockCopy } from "@/lib/markdown/codeBlock";
import hljs from "highlight.js";

interface MarkdownPreviewProps {
  markdown: string;
  isActive: boolean;
}

const MarkdownPreview = ({ markdown, isActive }: MarkdownPreviewProps) => {
  const [html, setHtml] = useState("");
  const [isPending, setIsPending] = useState(false);
  const lastFetched = useRef("");

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 입력값이 비어있을 경우 화면 및 캐시를 초기화
    if (!markdown?.trim()) {
      setHtml("");
      lastFetched.current = "";
      return;
    }

    // 컴포넌트가 비활성화 상태이거나 이전과 동일한 입력값일 경우 요청을 생략
    if (!isActive) return;
    if (markdown === lastFetched.current) return;

    const timer = setTimeout(async () => {
      setIsPending(true);

      const res = await previewPost(markdown);

      if (isSuccess(res)) {
        setHtml(res.data!.html);
        lastFetched.current = markdown;
      } else {
        console.error("Markdown Preview Error: ", res.error);
      }

      setIsPending(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [markdown, isActive]);

  useEffect(() => {
    const container = containerRef.current;
    if (!html || !container || !isActive) return;

    // 1. 이미지 로드 실패 대비 폴백 초기화
    initImageFallback(container);

    // 2. KaTeX 기반 수식 렌더링 처리
    renderMathInElement(container);

    // 3. Highlight.js 기반 코드 블록 구문 분석
    container.querySelectorAll("pre code").forEach((block) => {
      if (block.getAttribute("data-highlighted") === "yes") return;

      try {
        hljs.highlightElement(block as HTMLElement);
        block.setAttribute("data-highlighted", "yes");

        if (block.parentElement?.tagName === "PRE") {
          block.parentElement.classList.add("hljs");
        }
      } catch (error) {
        console.error("Highlight.js Error: ", error);
      }
    });

    const handleContainerClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const copyBtn = target.closest(
        ".cm-codeblock-copy-btn",
      ) as HTMLButtonElement;

      if (copyBtn) {
        handleCodeBlockCopy(copyBtn);
      }
    };

    container.addEventListener("click", handleContainerClick);

    return () => {
      cleanupImageFallback(container);
      container.removeEventListener("click", handleContainerClick);
    };
  }, [html, isActive]);

  /**
   * 상태에 따른 화면 렌더링 결과물을 결정합니다.
   */
  const renderContent = () => {
    if (html) return html;
    if (isPending || markdown.trim().length > 0) return "";
    return "<p class='text-muted-foreground italic text-sm'>작성된 내용이 없습니다.</p>";
  };

  return (
    <div className="relative h-full w-full bg-background" ref={containerRef}>
      {isPending && (
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-[10px] font-medium shadow-sm backdrop-blur border">
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
          <span>Rendering...</span>
        </div>
      )}
      <div
        className={cn(
          "cm-markdown markdown-root md:prose-lg dark:prose-invert px-6 py-8 max-w-full overflow-x-auto transition-all duration-200",
          isPending ? "opacity-40 blur-[1px]" : "opacity-100 blur-0",
        )}
        dangerouslySetInnerHTML={{ __html: renderContent() }}
      />
    </div>
  );
};

export default MarkdownPreview;
