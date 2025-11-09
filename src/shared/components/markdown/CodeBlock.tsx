"use client";

import React, { useCallback, useMemo, useState } from "react";
import hljs from "highlight.js/lib/core";
import { Check, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/shadcn/tooltip";
import { Button } from "@/shared/components/shadcn/button";
import { cn } from "@/lib/utils";

// 필요한 언어만 등록해라 (불필요하게 다 때려넣지 말고)
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import python from "highlight.js/lib/languages/python";
import go from "highlight.js/lib/languages/go";
import sql from "highlight.js/lib/languages/sql";
import "highlight.js/styles/github-dark.css";

hljs.registerLanguage("js", javascript);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("json", json);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("yml", yaml);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("python", python);
hljs.registerLanguage("go", go);
hljs.registerLanguage("sql", sql);

type Props = {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
};

/**
 * Markdown 코드블럭 컴포넌트
 * - inline: true → 인라인 코드
 * - inline: false → 블록 코드 (하이라이트 + 복사버튼)
 */
export const CodeBlock: React.FC<Props> = ({ inline, className, children }) => {
  const [copied, setCopied] = useState(false);

  const rawCode = String(children).replace(/\n$/, "");
  const lang = useMemo(() => {
    const match = /language-(\w+)/.exec(className || "");
    return match ? match[1].toLowerCase() : "";
  }, [className]);

  const highlighted = useMemo(() => {
    if (inline || !lang || !hljs.getLanguage(lang)) {
      return hljs.highlightAuto(rawCode).value;
    }
    return hljs.highlight(rawCode, { language: lang }).value;
  }, [rawCode, lang, inline]);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(rawCode);
      // 촉각 피드백 (지원 브라우저만)
      if (typeof navigator.vibrate === "function") navigator.vibrate(10);
      setCopied(true);
      // 1.2초 뒤 상태 복귀
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // 실패해도 조용히 무시 (원하면 toast로 안내 가능)
    }
  }, [rawCode]);

  // 인라인 코드
  if (inline) {
    return (
      <code
        className={cn(
          "rounded bg-muted px-1 py-0.5 font-mono text-sm text-foreground",
          className,
        )}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    );
  }

  // 블록 코드
  return (
    <div
      className={cn(
        "md-codeblock relative my-6 overflow-hidden rounded-lg border bg-card",
        copied && "ring-2 ring-primary/40", // 카피 순간 반짝 링
      )}
      data-copied={copied ? "true" : "false"}
    >
      <div
        className={cn(
          "md-codeblock__toolbar flex items-center justify-between border-b px-3 py-1.5 text-xs text-muted-foreground",
          "transition-colors",
          copied ? "bg-primary/10" : "bg-muted/40", // 카피 순간 배경 플래시
        )}
      >
        <span className="md-codeblock__lang font-medium">{lang || "text"}</span>

        {/* 접근성: 라이브 영역 */}
        <span className="sr-only" aria-live="polite">
          {copied ? "Copied to clipboard" : ""}
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCopy}
              className={cn(
                "size-6 transition-transform",
                copied && "scale-110", // 살짝 확대
              )}
              aria-label={copied ? "Copied" : "Copy code"}
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
        </Tooltip>
      </div>

      <pre className="overflow-x-auto text-sm leading-relaxed">
        <code
          className={cn("block p-4 font-mono", className)}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
};
