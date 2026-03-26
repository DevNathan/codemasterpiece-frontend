"use client";

import React, { useEffect, useRef } from "react";
import hljs from "highlight.js";

type Props = {
  content: string;
  className?: string;
};

export default function CommentContent({ content, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 댓글 내부에 코드 블록이 있을 경우 highlight.js를 적용한다.
    const codeBlocks = containerRef.current.querySelectorAll("pre code");
    codeBlocks.forEach((block) => {
      if (block.getAttribute("data-highlighted") === "yes") return;
      hljs.highlightElement(block as HTMLElement);
    });
  }, [content]);

  return (
    <div
      ref={containerRef}
      className={`cm-markdown cm-codeblock ${className || ""}`}
      dangerouslySetInnerHTML={{
        __html: content || "",
      }}
    />
  );
}
