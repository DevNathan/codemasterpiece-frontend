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
import { Button } from "@/shared/components/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/shadcn/tooltip";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/shared/components/shadcn/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/shadcn/tabs";
import { cn } from "@/lib/utils";
import {
  Bold,
  Code as CodeIcon,
  Columns,
  Eye,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Quote,
  UploadCloud,
} from "lucide-react";
import saveImage from "@/features/image/api/saveImage";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorSelection } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { formatKoreanDateTime } from "@/lib/util/timeFormatter";
import { useImageTokenResolver } from "../../../hook/useImageTokenResolver";
import PostMarkdownRenderer from "@/shared/components/markdown/PostMarkdownRenderer";

const MAX_MB = 8;

/** ─────────────────────────────────────────────────────────
 *  FormField — 컨테이너 + 상단 글로벌 컨트롤(레이아웃/풀스크린)
 *  ───────────────────────────────────────────────────────── */
const FormFieldMainContent = ({ className }: { className?: string }) => {
  const { control } = useFormContext();
  const [fullscreen, setFullscreen] = useState(false);
  const [layout, setLayout] = useState<"split" | "tabs">("tabs");

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  // 풀스크린 동안 바디 스크롤 잠그기
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
        <FormItem className={cn("block", className)}>
          <div className="flex items-center justify-between">
            <FormLabel className="font-semibold">본문 (Markdown)</FormLabel>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setLayout((l) => (l === "split" ? "tabs" : "split"))
                    }
                    aria-label="레이아웃 전환"
                  >
                    {layout === "split" ? (
                      <Eye className="size-4" />
                    ) : (
                      <Columns className="size-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {layout === "split" ? "탭 보기" : "분할 보기"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFullscreen((v) => !v)}
                    aria-label="전체 화면"
                  >
                    {fullscreen ? (
                      <Minimize2 className="size-4" />
                    ) : (
                      <Maximize2 className="size-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {fullscreen ? "닫기" : "전체 화면"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <FormControl>
            <div
              className={cn(
                "mt-2 rounded-xl border bg-background",
                fullscreen &&
                  "fixed inset-0 z-50 border-0 rounded-none p-3 md:p-5 bg-background/95 backdrop-blur",
              )}
            >
              <div className={cn("mx-auto", fullscreen ? "max-w-6xl" : "")}>
                <EditorShell
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  layout={layout}
                  fullscreen={fullscreen}
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

export default FormFieldMainContent;

/** ─────────────────────────────────────────────────────────
 *  EditorShell — 본체(툴바, 에디터/프리뷰, 상태바)
 *  ───────────────────────────────────────────────────────── */
function EditorShell({
  value,
  onChange,
  layout,
  fullscreen,
}: {
  value: string;
  onChange: (v: string) => void;
  layout: "split" | "tabs";
  fullscreen: boolean;
}) {
  const { theme, systemTheme } = useTheme();
  const { setCache, rewrite } = useImageTokenResolver();

  const [mounted, setMounted] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => setMounted(true), []);

  const effective = (theme === "system" ? systemTheme : theme) ?? "light";
  const cmTheme = useMemo(
    () =>
      effective === "dark" ? oneDark : EditorView.theme({}, { dark: false }),
    [effective],
  );

  const extensions = useMemo(
    () => [
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      EditorView.lineWrapping,
    ],
    [],
  );

  // 단축키
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;

      // Bold
      if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        insert("**", "**");
      }
      // Italic
      if (e.key.toLowerCase() === "i") {
        e.preventDefault();
        insert("_", "_");
      }
      // Link
      if (e.key.toLowerCase() === "k") {
        e.preventDefault();
        insert("[텍스트](", ")");
      }
      // Inline code
      if (e.key.toLowerCase() === "e") {
        e.preventDefault();
        insert("`", "`");
      }
      // Toggle preview
      if (e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        const el = document.querySelector<HTMLButtonElement>(
          "[data-toggle-preview]",
        );
        el?.click();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const insert = useCallback((before: string, after = "") => {
    const view = viewRef.current;
    if (!view) return;
    const { state } = view;
    const { from, to } = state.selection.main;
    const sel = state.sliceDoc(from, to);
    const tr = state.update({
      changes: { from, to, insert: `${before}${sel}${after}` },
      selection: EditorSelection.cursor(
        from + before.length + sel.length + after.length,
      ),
    });
    view.dispatch(tr);
    view.focus();
  }, []);

  const insertBlock = useCallback((prefix: string) => {
    const view = viewRef.current;
    if (!view) return;
    const { state } = view;
    const { from } = state.selection.main;
    const line = state.doc.lineAt(from);
    view.dispatch({
      changes: { from: line.from, to: line.from, insert: prefix },
      selection: EditorSelection.cursor(from + prefix.length),
    });
    view.focus();
  }, []);

  const onPasteOrDropFile = useCallback(
    async (file: File) => {
      // 1) 가드
      if (!file.type.startsWith("image/")) {
        const msg = "이미지 파일만 업로드 가능합니다.";
        setHint(msg);
        toast.error(msg);
        return;
      }
      if (file.size / 1024 / 1024 > MAX_MB) {
        const msg = `최대 ${MAX_MB}MB까지만 업로드 가능합니다.`;
        setHint(msg);
        toast.error(msg);
        return;
      }

      // 2) 로딩 토스트
      setHint("업로드 중…");
      const tid = toast.loading("이미지 업로드 중…");

      try {
        // 3) 업로드 (서버는 baseDir URL을 반환: .../ULID/)
        const { data, timestamp } = await saveImage(file);
        const { fileId, url } = data!;

        // 4) 본문에 토큰 삽입
        const alt = file.name;
        insert(`![${alt}](file://${fileId}`, `)`);

        // 5) 프리뷰용 캐시 저장 (fileId -> baseDir URL)
        setCache(fileId, url);

        // 6) 성공 토스트
        toast.success("이미지 업로드 완료", {
          id: tid,
          description: `${alt} — ${formatKoreanDateTime(new Date(timestamp))}`,
        });
      } catch (err) {
        // 실패 토스트
        toast.error("업로드 실패", {
          id: tid,
          description:
            (err as Error)?.message || "파일 업로드 중 문제가 발생했습니다.",
        });
        setHint("업로드 실패");
        return;
      } finally {
        setHint(null);
      }
    },
    [insert, setCache],
  );

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const f = e.clipboardData.files?.[0];
      if (f) {
        e.preventDefault();
        await onPasteOrDropFile(f);
      }
    },
    [onPasteOrDropFile],
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dt = e.dataTransfer;
      const file = dt.items?.length
        ? (Array.from(dt.items)
            .find((i) => i.kind === "file")
            ?.getAsFile() ?? null)
        : (dt.files?.[0] ?? null);
      if (file) await onPasteOrDropFile(file);
    },
    [onPasteOrDropFile],
  );

  const pickFile = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const f = input.files?.[0] || null;
      if (f) await onPasteOrDropFile(f);
    };
    input.click();
  }, [onPasteOrDropFile]);

  // 프리뷰 전용 문자열 (토큰 -> CDN URL로 리라이트)
  const previewMarkdown = useMemo(() => rewrite(value), [value, rewrite]);

  // 조기 리턴은 훅 뒤에서만
  if (!mounted) {
    return <div className="h-[70vh] rounded-xl border bg-muted/20" />;
  }

  const Toolbar = (
    <div className="sticky top-0 z-10 flex items-center gap-1 border-b bg-muted/30 px-2 py-1.5 rounded-t-xl">
      <IconBtn
        onClick={() => insert("**", "**")}
        icon={<Bold className="size-4" />}
        label="Bold (⌘/Ctrl+B)"
      />
      <IconBtn
        onClick={() => insert("_", "_")}
        icon={<Italic className="size-4" />}
        label="Italic (⌘/Ctrl+I)"
      />
      <IconBtn
        onClick={() => insert("`", "`")}
        icon={<CodeIcon className="size-4" />}
        label="Inline code (⌘/Ctrl+E)"
      />
      <IconBtn
        onClick={() => insert("[텍스트](", ")")}
        icon={<LinkIcon className="size-4" />}
        label="Link (⌘/Ctrl+K)"
      />
      <IconBtn
        onClick={() => insertBlock("\n- ")}
        icon={<List className="size-4" />}
        label="List"
      />
      <IconBtn
        onClick={() => insertBlock("\n1. ")}
        icon={<ListOrdered className="size-4" />}
        label="Numbered"
      />
      <IconBtn
        onClick={() => insertBlock("\n> ")}
        icon={<Quote className="size-4" />}
        label="Quote"
      />
      <div className="mx-1 h-4 w-px bg-border" />
      <IconBtn
        onClick={pickFile}
        icon={<UploadCloud className="size-4" />}
        label="이미지 업로드"
      />
      <IconBtn
        onClick={() => insert("\n![alt](", ")")}
        icon={<ImagePlus className="size-4" />}
        label="이미지 링크"
      />
      <div className="ml-auto text-xs text-muted-foreground pr-1">
        {hint ?? (fullscreen ? "Press Esc to exit fullscreen" : "")}
      </div>
    </div>
  );

  const StatusBar = (
    <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-1.5 rounded-b-xl text-xs text-muted-foreground">
      <span>
        {countWords(value)} words · {value.length} chars
      </span>
      <span>Drag & drop / Paste image to upload · Max {MAX_MB}MB</span>
    </div>
  );

  const editorShellClass = cn(
    "rounded-xl border overflow-hidden",
    dragging && "ring-2 ring-primary/60 ring-offset-2 ring-offset-background",
  );

  if (layout === "tabs") {
    return (
      <div
        className={editorShellClass}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {Toolbar}
        <Tabs defaultValue="write" className="h-[70vh]">
          <div className="sr-only">에디터 탭 전환</div>
          <TabsList className="m-2">
            <TabsTrigger value="write" data-toggle-preview>
              Write
            </TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="write" className="h-[calc(70vh-100px)]">
            <CodeMirror
              value={value}
              height="100%"
              theme={cmTheme}
              extensions={extensions}
              basicSetup={{ lineNumbers: true, foldGutter: true, tabSize: 2 }}
              onCreateEditor={(v) => (viewRef.current = v)}
              onChange={onChange}
              onPaste={handlePaste as any}
              className="h-full"
            />
          </TabsContent>
          <TabsContent
            value="preview"
            className="h-[calc(70vh-100px)] overflow-auto"
          >
            <MarkdownPreview markdown={previewMarkdown} />
          </TabsContent>
        </Tabs>
        {StatusBar}
      </div>
    );
  }

  return (
    <div
      className={editorShellClass}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {Toolbar}
      <ResizablePanelGroup direction="horizontal" className="h-[70vh]">
        <ResizablePanel defaultSize={50} minSize={30}>
          <CodeMirror
            value={value}
            height="100%"
            theme={cmTheme}
            extensions={extensions}
            basicSetup={{ lineNumbers: true, foldGutter: true, tabSize: 2 }}
            onCreateEditor={(v) => (viewRef.current = v)}
            onChange={onChange}
            onPaste={handlePaste as any}
            className="h-full"
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={30} className="overflow-auto">
          <MarkdownPreview markdown={previewMarkdown} />
        </ResizablePanel>
      </ResizablePanelGroup>
      {StatusBar}
    </div>
  );
}

export function MarkdownPreview({ markdown }: { markdown: string }) {
  return (
    <div
      className={cn(
        "markdown-root md:prose-lg dark:prose-invert px-4 py-3",
        "max-w-full overflow-x-auto",
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight as any]}
        components={PostMarkdownRenderer}
      >
        {markdown || "_작성된 내용이 없습니다._"}
      </ReactMarkdown>
    </div>
  );
}

/** ─────────────────────────────────────────────────────────
 *  유틸
 *  ───────────────────────────────────────────────────────── */
function IconBtn({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClick}
          aria-label={label}
          title={label}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function countWords(s: string) {
  if (!s) return 0;
  return (s.match(/\b\S+\b/g) ?? []).length;
}
