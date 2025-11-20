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

// 언어만 등록
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import java from "highlight.js/lib/languages/java";
import c from "highlight.js/lib/languages/c";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import python from "highlight.js/lib/languages/python";
import go from "highlight.js/lib/languages/go";
import sql from "highlight.js/lib/languages/sql";
import "@/shared/components/markdown/code-highlight.css";

hljs.registerLanguage("js", javascript);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("java", java);
hljs.registerLanguage("c", c);
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
      if (typeof navigator.vibrate === "function") navigator.vibrate(10);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }, [rawCode]);

  // 인라인
  if (inline) {
    return (
      <code
        className={cn(
          "cm-code-inline rounded bg-muted px-1 py-0.5 font-mono text-sm text-foreground",
          className,
        )}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    );
  }

  // 블록
  return (
    <div
      className={cn(
        "cm-codeblock relative my-6 overflow-hidden rounded-lg border bg-card",
        copied && "ring-2 ring-primary/40",
      )}
    >
      <div
        className={cn(
          "cm-codeblock__toolbar flex items-center justify-between border-b px-3 py-1.5 text-xs text-muted-foreground",
          "transition-colors",
          copied ? "bg-primary/10" : "bg-muted/40",
        )}
      >
        <span className="cm-codeblock__lang font-medium">{lang || "text"}</span>

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
                copied && "scale-110",
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
          className={cn("hljs block p-4 font-mono", className)}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
};
