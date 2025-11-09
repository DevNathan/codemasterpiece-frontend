"use client";

import React from "react";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";
import { Separator } from "@/shared/components/shadcn/separator";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/shadcn/alert";
import { CodeBlock } from "@/shared/components/markdown/CodeBlock";

/**
 * 댓글 전용 마크다운 컴포넌트:
 * - 허용: p, strong, em, code/pre, ul/ol/li, blockquote, hr
 * - 차단: headings, a, img, table 계열, HTML 전부
 * 디자인은 포스트 렌더러 톤과 동일하게 맞춤.
 */
const CommentMarkdownRenderer: Components = {
  /* paragraph */
  p({ children, className }) {
    return (
      <p className={cn("leading-7 [&:not(:first-child)]:mt-3", className)}>
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
            "rounded bg-muted px-1 py-0.5 font-mono text-[13px]",
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
          "my-3 ml-5 list-disc marker:text-muted-foreground space-y-1.5",
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
          "my-3 ml-5 list-decimal marker:text-muted-foreground space-y-1.5",
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

  /* quote -> Alert 스타일 */
  blockquote({ children, className }) {
    const content = Array.isArray(children) ? children : [children];
    const title = content[0];
    const rest = content.slice(1);
    return (
      <Alert className={cn("my-3", className)}>
        {title && <AlertTitle>{title}</AlertTitle>}
        {rest.length > 0 && <AlertDescription>{rest}</AlertDescription>}
      </Alert>
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

  /* 명시적으로 미지원 요소들(타입 호환용 no-op) */
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
