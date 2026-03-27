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

/**
 * @component MarkdownPreview
 * @description 입력된 마크다운을 서버에서 렌더링된 HTML로 변환하여 보여주는 프리뷰 컴포넌트입니다.
 * 디바운싱(Debouncing)을 통해 서버 부하를 줄이고, 하이라이팅 및 수식 렌더링을 처리합니다.
 */
const MarkdownPreview = ({ markdown, isActive }: MarkdownPreviewProps) => {
  const [html, setHtml] = useState("");
  const [isPending, setIsPending] = useState(false);
  const lastFetched = useRef("");

  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * 마크다운 입력값의 변화를 감지하고 서버에 프리뷰 요청을 보냅니다.
   * Cascading Render 방지를 위해 초기화 로직을 비동기 흐름(timer) 내부로 이동했습니다.
   */
  useEffect(() => {
    // 활성화 상태가 아니거나 이전과 동일한 값이면 무시 (빈 값 포함)
    if (!isActive || markdown === lastFetched.current) return;

    const timer = setTimeout(async () => {
      // 입력값이 비어있을 경우 화면 및 캐시를 비동기적으로 초기화하여 연쇄 렌더링 방지
      if (!markdown?.trim()) {
        setHtml("");
        lastFetched.current = "";
        return;
      }

      setIsPending(true);

      try {
        const res = await previewPost(markdown);

        if (isSuccess(res)) {
          setHtml(res.data!.html);
          lastFetched.current = markdown;
        } else {
          console.error("Markdown Preview Error: ", res.error);
        }
      } catch (err) {
        console.error("Preview Network Error: ", err);
      } finally {
        setIsPending(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [markdown, isActive]);

  /**
   * 렌더링된 HTML이 변경될 때 후처리(하이라이팅, 수식, 이미지 폴백 등)를 수행합니다.
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!html || !container || !isActive) return;

    // 이미지 로드 실패 대비 폴백 초기화
    initImageFallback(container);

    // KaTeX 기반 수식 렌더링 처리
    renderMathInElement(container);

    // Highlight.js 기반 코드 블록 구문 분석
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
