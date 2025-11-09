"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import CommentMarkdownRenderer from "@/shared/components/markdown/CommentMarkdownRender";

/**
 * 댓글 마크다운 파서:
 * - GFM 미사용(체크리스트/테이블 방지)
 * - HTML 무시
 * - 링크/이미지/헤딩 등 제거: allowedElements로 화이트리스트 방식
 * - unwrapDisallowed: 링크 텍스트만 남도록
 */
type Props = {
  content: string;
  className?: string;
};

const allowed = [
  "p",
  "strong",
  "em",
  "code",
  "pre",
  "ul",
  "ol",
  "li",
  "blockquote",
  "hr",
  // 텍스트 노드는 항상 허용
];

export default function CommentContent({ content, className }: Props) {
  return (
    <div className={className}>
      <ReactMarkdown
        // 보안
        skipHtml
        // 화이트리스트
        allowedElements={allowed as any}
        // 링크/이미지/헤딩 등 disallowed → 내용만 남김
        unwrapDisallowed
        // 컴포넌트 매핑
        components={CommentMarkdownRenderer}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}
