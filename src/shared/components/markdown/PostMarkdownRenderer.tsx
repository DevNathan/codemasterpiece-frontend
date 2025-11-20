"use client";

import React, { useEffect } from "react";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";
import { Separator } from "@/shared/components/shadcn/separator";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/shadcn/alert";
import { ImageOff, Link as LinkIcon } from "lucide-react";
import { CodeBlock } from "@/shared/components/markdown/CodeBlock";
import { useHeadingRegistry } from "@/shared/components/markdown/HeadingContext";
import { scrollToId } from "@/lib/scrollToId";
import { useImageViewer } from "@/contexts/ImageViewProvider";

/* ── helpers ─────────────────────────────────────────────────────────────── */
const textOf = (node: React.ReactNode): string => {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>;
    return textOf(el.props?.children);
  }
  return "";
};

const heading =
  (
    Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
    base: string,
    depth: 1 | 2 | 3 | 4 | 5 | 6,
  ) =>
  ({ children }: { children?: React.ReactNode }) => {
    const { register, allocId } = useHeadingRegistry();
    const raw = textOf(children).trim();
    if (!raw) {
      return (
        <Tag className={cn("group scroll-m-20 font-bold tracking-tight", base)}>
          {children}
        </Tag>
      );
    }

    const finalId = React.useMemo(() => allocId(raw), [allocId, raw]);

    useEffect(() => {
      register({ id: finalId!, text: raw, depth });
    }, [finalId, raw, depth, register]);

    return (
      <Tag
        id={finalId}
        className={cn("group scroll-m-20 font-bold tracking-tight", base)}
      >
        <button
          type="button"
          aria-label={`Jump to ${raw}`}
          onClick={(e) => {
            e.preventDefault();
            scrollToId(finalId, 72);
          }}
          className="inline-flex items-center gap-2 no-underline hover:underline decoration-dotted underline-offset-4"
        >
          <span>{children}</span>
          <LinkIcon className="size-4 opacity-0 transition-opacity group-hover:opacity-60" />
        </button>
      </Tag>
    );
  };

/* 이미지 단독 문단 감지 → <figure> 승격 */
type HastElement = {
  type: string;
  tagName?: string;
  properties?: any;
  children?: any[];
};
function isImageOnlyParagraph(node?: HastElement): boolean {
  if (!node?.children || node.children.length !== 1) return false;
  const child = node.children[0] as HastElement;
  return child?.type === "element" && child.tagName === "img";
}
function getImageTitleFromParagraph(node?: HastElement): string | undefined {
  const child = node?.children?.[0] as HastElement | undefined;
  const title = (child?.properties as any)?.title as string | undefined;
  return title?.trim() || undefined;
}

/* ── renderer ─────────────────────────────────────────────────────────────── */
const PostMarkdownRenderer: Components = {
  /* headings: GitHub 느낌으로 h1/h2에 바텀 보더 */
  h1: heading(
    "h1",
    "mt-10 mb-6 pb-3 text-3xl md:text-4xl border-b border-border break-words",
    1,
  ),
  h2: heading(
    "h2",
    "mt-10 mb-5 pb-2 text-2xl md:text-3xl border-b border-border/60 break-words",
    2,
  ),
  h3: heading("h3", "text-xl md:text-2xl mt-8 mb-4 break-words", 3),
  h4: heading("h4", "text-lg md:text-xl mt-6 mb-3 break-words", 4),
  h5: heading("h5", "text-base md:text-lg mt-5 mb-2 break-words", 5),
  h6: heading(
    "h6",
    "text-sm md:text-base mt-4 mb-2 text-muted-foreground break-words",
    6,
  ),

  /* paragraph with image-only upgrade */
  p({ node, children, className }) {
    if (isImageOnlyParagraph(node as any)) {
      const caption = getImageTitleFromParagraph(node as any);
      return (
        <figure className="my-4 mx-auto w-full max-w-[min(100%,900px)]">
          {children}
          {caption && (
            <figcaption className="mt-2 text-center text-xs text-muted-foreground break-words">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    }
    return (
      <p
        className={cn(
          "leading-7 [&:not(:first-child)]:mt-6 break-words",
          className,
        )}
      >
        {children}
      </p>
    );
  },

  /* links */
  a({ href = "", children, className, ...props }) {
    const isExternal = /^https?:\/\//i.test(href) || href.startsWith("//");

    return (
      <a
        href={href}
        {...props}
        className={cn(
          `text-point underline underline-offset-4 hover:opacity-90 break-words visited:text-point/70 transition-colors duration-200`,
          className,
        )}
        {...(isExternal ? { target: "_blank", rel: "noreferrer" } : undefined)}
      >
        {children}
      </a>
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

  /* images with fallback */
  img({ src = "", alt = "", className, ...props }) {
    const [error, setError] = React.useState(false);
    const { open } = useImageViewer();

    if (error || !src) {
      return (
        <div
          className={cn(
            "group flex flex-col items-center justify-center",
            "my-4 mx-auto rounded-lg border border-border/50 bg-muted/60 text-muted-foreground",
            "w-full max-w-[min(100%,900px)] aspect-video text-center select-none",
            "transition-colors duration-200 hover:bg-muted/80",
            className,
          )}
        >
          <ImageOff className="mb-2 size-6 opacity-70 group-hover:opacity-90" />
          <span className="text-sm font-medium tracking-wide opacity-80 group-hover:opacity-100">
            {alt
              ? `이미지를 불러올 수 없습니다: ${alt}`
              : "이미지를 불러올 수 없습니다."}
          </span>
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setError(true)}
        onClick={() => open(src as string, alt)}
        className={cn(
          "rounded-md border bg-card my-4 mx-auto block max-w-full h-auto",
          "cursor-zoom-in transition-transform duration-200 hover:opacity-90",
          className,
        )}
        {...props}
      />
    );
  },

  /* lists */
  ul({ children, className, ...props }) {
    return (
      <ul
        className={cn(
          "my-6 ml-6 list-disc marker:text-muted-foreground space-y-2",
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
          "my-6 ml-6 list-decimal marker:text-muted-foreground space-y-2",
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

  /* blockquote: GitHub callout + 일반 인용 분리 */
  blockquote({ children, className }) {
    const raw = textOf(children).trim();
    const lines = raw.split(/\r?\n/);

    const firstLine = lines[0] ?? "";
    const m = /^\[!([a-zA-Z]+)\]\s*(.*)$/.exec(firstLine);

    if (m) {
      const kindRaw = m[1];
      const afterTag = m[2] ?? "";
      const kind = kindRaw.toLowerCase();

      const { containerClass, labelClass, labelText } = (() => {
        switch (kind) {
          case "important":
            return {
              containerClass: "border-point/60 bg-point/5",
              labelClass: "bg-point/15 text-point",
              labelText: "Important",
            };
          case "warning":
          case "caution":
            return {
              containerClass: "border-amber-500/60 bg-amber-500/10",
              labelClass: "bg-amber-500/20 text-amber-300",
              labelText: kind === "warning" ? "Warning" : "Caution",
            };
          case "danger":
          case "error":
            return {
              containerClass: "border-red-500/60 bg-red-500/10",
              labelClass: "bg-red-500/20 text-red-300",
              labelText: "Danger",
            };
          case "tip":
            return {
              containerClass: "border-emerald-500/60 bg-emerald-500/10",
              labelClass: "bg-emerald-500/20 text-emerald-300",
              labelText: "Tip",
            };
          case "note":
          case "info":
            return {
              containerClass: "border-sky-500/60 bg-sky-500/10",
              labelClass: "bg-sky-500/20 text-sky-300",
              labelText: kind === "note" ? "Note" : "Info",
            };
          default:
            return {
              containerClass: "border-border bg-muted/60",
              labelClass: "bg-muted text-muted-foreground",
              labelText: kindRaw,
            };
        }
      })();

      // body: 라벨 줄 제외 전부
      const bodyLines: string[] = [];
      if (afterTag) {
        bodyLines.push(afterTag);
        bodyLines.push(...lines.slice(1));
      } else {
        bodyLines.push(...lines.slice(1));
      }
      const bodyText = bodyLines.join("\n").trim();

      return (
        <Alert
          className={cn(
            "my-6 border px-4 pt-4 pb-3 text-sm",
            "bg-background/80 backdrop-blur",
            containerClass,
            className,
          )}
        >
          <AlertTitle className="text-[0.7rem] font-semibold uppercase tracking-wide">
            <span
              className={cn("inline-flex rounded px-1.5 py-0.5", labelClass)}
            >
              {labelText}
            </span>
          </AlertTitle>

          {bodyText && (
            <AlertDescription className="mt-2 whitespace-pre-line text-sm text-primary">
              {bodyText}
            </AlertDescription>
          )}
        </Alert>
      );
    }

    // 일반 blockquote: Alert 안 쓰고 따로 디자인
    const content = Array.isArray(children) ? children : [children];

    return (
      <div
        className={cn(
          "my-6 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm",
          "relative",
          className,
        )}
      >
        <div className="absolute left-0 top-0 h-full w-1 rounded-l-md bg-border/80" />
        <div className="relative space-y-1 whitespace-pre-line">{content}</div>
      </div>
    );
  },

  hr() {
    return <Separator className="my-8" />;
  },

  /* table: 행 + 열 모두 라인, 열은 좀 더 옅게 */
  table({ children, className, ...props }) {
    return (
      <div className="my-6 w-full overflow-x-auto rounded-md border">
        <table
          className={cn(
            "w-full text-sm border-collapse [&_th]:text-left",
            className,
          )}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  },
  thead({ children, className, ...props }) {
    return (
      <thead className={cn("bg-muted/60 border-b", className)} {...props}>
        {children}
      </thead>
    );
  },
  tbody({ children, className, ...props }) {
    return (
      <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props}>
        {children}
      </tbody>
    );
  },
  tr({ children, className, ...props }) {
    return (
      <tr
        className={cn("border-b border-border hover:bg-muted/30", className)}
        {...props}
      >
        {children}
      </tr>
    );
  },
  th({ children, className, ...props }) {
    return (
      <th
        className={cn(
          "px-3 py-2 font-semibold text-foreground align-middle",
          "border-r border-border/40",
          className,
        )}
        {...props}
      >
        {children}
      </th>
    );
  },
  td({ children, className, ...props }) {
    return (
      <td
        className={cn(
          "px-3 py-2 align-top",
          "border-r border-border/40",
          className,
        )}
        {...props}
      >
        {children}
      </td>
    );
  },

  /* inline 스타일들 */
  strong({ children, className }) {
    return (
      <strong className={cn("font-semibold", className)}>{children}</strong>
    );
  },
  em({ children, className }) {
    return <em className={cn("italic", className)}>{children}</em>;
  },

  /* <sub>, <sup> 처리 */
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
      <sup className={cn("align-super text-[0.7em]", className)} {...props}>
        {children}
      </sup>
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

  /* ==하이라이트== → <mark>, text-point 고정 */
  mark({ children, className, ...props }) {
    return (
      <mark
        className={cn("rounded px-1 bg-point/10 text-point", className)}
        {...props}
      >
        {children}
      </mark>
    );
  },

  kbd({ children, className, ...props }) {
    return (
      <kbd
        className={cn(
          "rounded border bg-muted px-1.5 py-0.5 text-xs font-medium",
          className,
        )}
        {...props}
      >
        {children}
      </kbd>
    );
  },
  details({ children, className, ...props }) {
    return (
      <details
        className={cn(
          "my-4 rounded-md border bg-card [&[open]>summary]:border-b",
          className,
        )}
        {...props}
      >
        {children}
      </details>
    );
  },
  summary({ children, className, ...props }) {
    return (
      <summary
        className={cn(
          "cursor-pointer list-none px-4 py-2 font-medium hover:bg-muted/50",
          className,
        )}
        {...props}
      >
        {children}
      </summary>
    );
  },
};

export default PostMarkdownRenderer;
