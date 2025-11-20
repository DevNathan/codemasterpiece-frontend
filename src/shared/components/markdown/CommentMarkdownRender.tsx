"use client";

import React from "react";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";
import { Separator } from "@/shared/components/shadcn/separator";
import { CodeBlock } from "@/shared/components/markdown/CodeBlock";

/**
 * 댓글 전용 마크다운 컴포넌트:
 * - 허용: p, strong, em, code/pre, ul/ol/li, blockquote, hr (+ mark, u, sub, sup)
 * - 차단: headings, a, img, table, HTML 전부
 * - 디자인: 포스트 렌더러와 톤 통일
 */
const CommentMarkdownRenderer: Components = {
  /* paragraph */
  p({ children, className }) {
    return (
      <p
        className={cn(
          "leading-7 [&:not(:first-child)]:mt-3",
          className,
        )}
      >
        {children}
      </p>
    );
  },

  /* code: inline vs block */
  code({
         inline,
         className,
         children,
       }: {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
  }) {
    const raw = String(children ?? "");
    const hasLang = /\blanguage-([\w-]+)\b/i.test(className ?? "");
    const isInline = inline ?? (!hasLang && !raw.includes("\n"));

    if (isInline) {
      return (
        <code
          className={cn(
            "rounded bg-muted px-1 py-0.5 font-mono text-sm",
            className,
          )}
        >
          {children}
        </code>
      );
    }

    return (
      <CodeBlock inline={false} className={className}>
        {children as React.ReactNode}
      </CodeBlock>
    );
  },

  /* pre unwrap */
  pre({ children }) {
    return <>{children}</>;
  },

  /* lists */
  ul({ children, className, ...props }) {
    return (
      <ul
        className={cn(
          "my-3 ml-6 list-disc marker:text-muted-foreground space-y-2",
          className,
        )}
        {...props}
      >
        {children}
      </ul>
    );
  },
  ol({ children, className, ...props }) {
    return (
      <ol
        className={cn(
          "my-3 ml-6 list-decimal marker:text-muted-foreground space-y-2",
          className,
        )}
        {...props}
      >
        {children}
      </ol>
    );
  },
  li({ children, className, ...props }) {
    return (
      <li className={cn("leading-7", className)} {...props}>
        {children}
      </li>
    );
  },

  /* blockquote – 포스트 일반 인용문 스타일 */
  blockquote({ children, className }) {
    const content = Array.isArray(children) ? children : [children];

    return (
      <div
        className={cn(
          "my-3 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm",
          "relative",
          className,
        )}
      >
        <div className="absolute left-0 top-0 h-full w-1 rounded-l-md bg-border/80" />
        <div className="relative space-y-1 whitespace-pre-line">
          {content}
        </div>
      </div>
    );
  },

  /* horizontal rule */
  hr() {
    return <Separator className="my-6" />;
  },

  /* strong/em */
  strong({ children, className }) {
    return (
      <strong className={cn("font-semibold", className)}>{children}</strong>
    );
  },
  em({ children, className }) {
    return <em className={cn("italic", className)}>{children}</em>;
  },

  /* ==하이라이트== → <mark>, text-point 고정 */
  mark({ children, className, ...props }) {
    return (
      <mark
        className={cn(
          "rounded px-1 bg-point/10 text-point",
          className,
        )}
        {...props}
      >
        {children}
      </mark>
    );
  },

  /* ++밑줄++ → <u> */
  u({ children, className, ...props }) {
    return (
      <span
        className={cn(
          "underline underline-offset-4 decoration-muted-foreground/70",
          className,
        )}
        {...props}
      >
        {children}
      </span>
    );
  },

  /* sub / sup */
  sub({ children, className, ...props }) {
    return (
      <sub
        className={cn(
          "align-baseline text-[0.7em] translate-y-[0.1em]",
          className,
        )}
        {...props}
      >
        {children}
      </sub>
    );
  },
  sup({ children, className, ...props }) {
    return (
      <sup
        className={cn("align-super text-[0.7em]", className)}
        {...props}
      >
        {children}
      </sup>
    );
  },

  /* 명시적으로 미지원 요소들 (타입 호환용 no-op) */
  a() {
    return null;
  },
  img() {
    return null;
  },
  table() {
    return null;
  },
  thead() {
    return null;
  },
  tbody() {
    return null;
  },
  tr() {
    return null;
  },
  th() {
    return null;
  },
  td() {
    return null;
  },
  h1() {
    return null;
  },
  h2() {
    return null;
  },
  h3() {
    return null;
  },
  h4() {
    return null;
  },
  h5() {
    return null;
  },
  h6() {
    return null;
  },
};

export default CommentMarkdownRenderer;
