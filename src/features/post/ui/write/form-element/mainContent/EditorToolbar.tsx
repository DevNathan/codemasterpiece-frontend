"use client";

import React, { useCallback, useState } from "react";
import {
  Bold,
  Code as CodeIcon,
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
import { Button } from "@/shared/components/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/shadcn/tooltip";
import { toast } from "sonner";
import saveImage from "@/features/image/api/saveImage";
import { formatKoreanDateTime } from "@/lib/util/timeFormatter";
import { TabsList, TabsTrigger } from "@/shared/components/shadcn/tabs";

const MAX_MB = 8;

interface EditorToolbarProps {
  onInsert: (before: string, after?: string) => void;
  onInsertBlock: (prefix: string) => void;
  onUploadSuccess: (fileId: string, url: string) => void;
  fullscreen: boolean;
  setFullscreen: (fullscreen: boolean) => void;
}

const EditorToolbar = ({
  onInsert,
  onInsertBlock,
  onUploadSuccess,
  fullscreen,
  setFullscreen,
}: EditorToolbarProps) => {
  const [hint, setHint] = useState<string | null>(null);

  /**
   * 파일 선택 창을 띄우고 이미지를 서버로 전송합니다.
   */
  const handleUpload = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("이미지 파일만 업로드 가능합니다.");
        return;
      }
      if (file.size / 1024 / 1024 > MAX_MB) {
        toast.error(`최대 ${MAX_MB}MB까지만 업로드 가능합니다.`);
        return;
      }

      setHint("업로드 중…");
      const tid = toast.loading("이미지 업로드 중…");

      try {
        const { data, timestamp } = await saveImage(file);
        const { fileId, url } = data!;

        onInsert(`![${file.name}](image-token://${fileId}`, `)`);

        onUploadSuccess(fileId, url);

        toast.success("이미지 업로드 완료", {
          id: tid,
          description: `${file.name} — ${formatKoreanDateTime(new Date(timestamp))}`, //
        });
      } catch (err) {
        toast.error("업로드 실패", { id: tid });
      } finally {
        setHint(null);
      }
    };

    input.click();
  }, [onInsert, onUploadSuccess]);

  return (
    <div className="sticky top-0 z-10 flex items-center gap-1 border-b bg-muted/30 px-2 py-1.5 rounded-t-xl shrink-0">
      <IconBtn
        onClick={() => onInsert("**", "**")}
        icon={<Bold className="size-4" />}
        label="Bold"
      />
      <IconBtn
        onClick={() => onInsert("_", "_")}
        icon={<Italic className="size-4" />}
        label="Italic"
      />
      <IconBtn
        onClick={() => onInsert("`", "`")}
        icon={<CodeIcon className="size-4" />}
        label="Inline code"
      />
      <IconBtn
        onClick={() => onInsert("[텍스트](", ")")}
        icon={<LinkIcon className="size-4" />}
        label="Link"
      />
      <div className="mx-1 h-4 w-px bg-border" />
      <IconBtn
        onClick={() => onInsertBlock("- ")}
        icon={<List className="size-4" />}
        label="List"
      />
      <IconBtn
        onClick={() => onInsertBlock("1. ")}
        icon={<ListOrdered className="size-4" />}
        label="Numbered"
      />
      <IconBtn
        onClick={() => onInsertBlock("> ")}
        icon={<Quote className="size-4" />}
        label="Quote"
      />
      <div className="mx-1 h-4 w-px bg-border" />
      <IconBtn
        onClick={handleUpload}
        icon={<UploadCloud className="size-4" />}
        label="이미지 업로드"
      />
      <IconBtn
        onClick={() => onInsert("\n![alt](", ")")}
        icon={<ImagePlus className="size-4" />}
        label="이미지 링크"
      />

      <div className="flex justify-center items-center ml-auto pr-2">
        <span className="text-[11px] text-muted-foreground font-medium mr-3 transition-opacity">
          {hint ?? (fullscreen ? "Press Esc to exit fullscreen" : "")}
        </span>

        <TabsList className="h-8 shrink-0 bg-muted/50">
          <TabsTrigger value="write" className="text-xs h-7 px-3">
            Write
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-xs h-7 px-3">
            Preview
          </TabsTrigger>
        </TabsList>

        <div className="mx-2 h-4 w-px bg-border" />

        {fullscreen ? (
          <IconBtn
            onClick={() => setFullscreen(false)}
            icon={<Minimize2 className="size-4" />}
            label="전체 화면 나가기"
          />
        ) : (
          <IconBtn
            onClick={() => setFullscreen(true)}
            icon={<Maximize2 className="size-4" />}
            label="전체 화면"
          />
        )}
      </div>
    </div>
  );
};

export default EditorToolbar;

/** ─────────────────────────────────────────────────────────
 * 유틸 버튼 컴포넌트
 * ───────────────────────────────────────────────────────── */
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
          className="h-8 w-8"
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
