"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/shadcn/form";
import { Tabs } from "@/shared/components/shadcn/tabs";
import { cn } from "@/lib/utils";
import { useImageTokenResolver } from "@/features/post/hook/useImageTokenResolver";
import EditorToolbar from "./EditorToolbar";
import MarkdownPreview from "./MarkdownPreview";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";

const FormFieldMainContent = ({ className }: { className?: string }) => {
  const { control } = useFormContext();
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  useEffect(() => {
    if (!fullscreen) return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = prev;
    };
  }, [fullscreen]);

  return (
    <FormField
      control={control}
      name="mainContent"
      render={({ field }) => (
        <FormItem className={cn("flex flex-col", className)}>
          <FormLabel className="font-semibold text-lg">내용</FormLabel>
          <FormControl className={"gap-0"}>
            <div
              className={cn(
                "mt-2 rounded-xl border bg-background transition-all",
                fullscreen &&
                  "mt-0 fixed inset-0 z-50 border-0 rounded-none bg-background overflow-auto flex flex-col",
              )}
            >
              <div
                className={cn(
                  "mx-auto w-full flex flex-col",
                  fullscreen && "mx-0 flex-1 h-full",
                )}
              >
                <EditorShell
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  fullscreen={fullscreen}
                  setFullscreen={setFullscreen}
                />
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

function EditorShell({ value, onChange, fullscreen, setFullscreen }: any) {
  const { theme, systemTheme } = useTheme();
  const { setCache, rewrite } = useImageTokenResolver();

  const viewRef = useRef<EditorView | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("write");

  const effective = (theme === "system" ? systemTheme : theme) ?? "light";

  const extensions = useMemo(
    () => [
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      EditorView.lineWrapping,
    ],
    [],
  );

  useEffect(() => setMounted(true), []);

  const previewMarkdown = useMemo(() => rewrite(value), [value, rewrite]);

  const handleInsert = useCallback((before: string, after = "") => {
    const view = viewRef.current;
    if (!view) return;

    const { from, to } = view.state.selection.main;
    const selectedText = view.state.sliceDoc(from, to);
    const insertText = `${before}${selectedText}${after}`;

    view.dispatch({
      changes: { from, to, insert: insertText },
      selection: {
        anchor: from + before.length,
        head: from + before.length + selectedText.length,
      },
    });
    view.focus();
  }, []);

  const handleInsertBlock = useCallback((prefix: string) => {
    const view = viewRef.current;
    if (!view) return;

    const { from } = view.state.selection.main;
    const line = view.state.doc.lineAt(from);

    view.dispatch({
      changes: { from: line.from, insert: prefix },
      selection: { anchor: view.state.selection.main.anchor + prefix.length },
    });
    view.focus();
  }, []);

  if (!mounted)
    return <div className="h-[600px] rounded-xl border bg-muted/20" />;

  return (
    <div
      className={cn(
        "rounded-xl border flex flex-col w-full bg-card overflow-hidden",
        fullscreen ? "rounded-none flex-1 h-full" : "h-[600px] min-h-[500px]",
      )}
    >
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col flex-1 min-h-0 gap-0"
      >
        <EditorToolbar
          onInsert={handleInsert}
          onInsertBlock={handleInsertBlock}
          onUploadSuccess={setCache}
          fullscreen={fullscreen}
          setFullscreen={setFullscreen}
        />

        <div className="relative flex-1 w-full mt-0 overflow-hidden">
          <CodeMirror
            value={value}
            height="100%"
            theme={effective === "dark" ? "dark" : "light"}
            extensions={extensions}
            basicSetup={{ lineNumbers: true, foldGutter: true, tabSize: 2 }}
            onCreateEditor={(v) => (viewRef.current = v)}
            onChange={onChange}
            className="h-full"
          />
          <div
            className={cn(
              "absolute inset-0 bg-background overflow-auto transition-opacity duration-200",
              activeTab === "preview"
                ? "z-20 opacity-100"
                : "z-0 opacity-0 pointer-events-none",
            )}
          >
            <MarkdownPreview
              markdown={previewMarkdown}
              isActive={activeTab === "preview"}
            />
          </div>
        </div>
      </Tabs>
      <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-1.5 text-[10px] text-muted-foreground shrink-0 uppercase tracking-widest">
        <span>{value.length} characters</span>
      </div>
    </div>
  );
}

export default FormFieldMainContent;
