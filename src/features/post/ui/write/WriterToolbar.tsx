// features/post/ui/write/WriterToolbar.tsx
"use client";

import { Button } from "@/shared/components/shadcn/button";
import { Separator } from "@/shared/components/shadcn/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/shadcn/tooltip";
import { Kbd } from "@/shared/components/shadcn/kbd";
import { ArrowLeft, Eye, Save, Send } from "lucide-react";

interface Props {
  isPublished: boolean;
  isEditMode?: boolean;
  onDraft: () => void;
  onPreview: () => void;
  onSubmit: () => void;
  onNavigateHome: () => void;
}

const WriterToolbar = ({
  isPublished,
  onDraft,
  onPreview,
  onSubmit,
  onNavigateHome,
}: Props) => (
  <div className="sticky top-12 md:top-14 z-30 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="mx-auto max-w-5xl px-4 py-2 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNavigateHome}
          aria-label="뒤로"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <div className="hidden sm:flex items-center gap-2 text-[11px]">
          <span className="opacity-80">단축키</span>
          <span className="mx-1">|</span>
          <span className="flex items-center gap-1">
            제출:
            <Kbd>Mod</Kbd>+<Kbd>Enter</Kbd>
          </span>
          <span className="mx-1">|</span>
          <span className="flex items-center gap-1">
            임시저장:
            <Kbd>Alt</Kbd>+<Kbd>S</Kbd>
          </span>
          <span className="mx-1">|</span>
          <span className="flex items-center gap-1">
            미리보기:
            <Kbd>Alt</Kbd>+<Kbd>P</Kbd>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="outline" onClick={onDraft}>
              <Save className="mr-2 size-4" />
              임시저장
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-1 text-xs">
              <Kbd>Alt</Kbd>+<Kbd>S</Kbd>
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="secondary" onClick={onPreview}>
              <Eye className="mr-2 size-4" />
              미리보기
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-1 text-xs">
              <Kbd>Alt</Kbd>+<Kbd>P</Kbd>
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" onClick={onSubmit}>
              <Send className="mr-2 size-4" />
              {isPublished ? "발행하기" : "저장하기"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-1 text-xs">
              <Kbd>Mod</Kbd>+<Kbd>Enter</Kbd>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  </div>
);

export default WriterToolbar;
