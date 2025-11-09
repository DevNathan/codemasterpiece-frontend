"use client";

import React, { useCallback, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
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
import { AspectRatio } from "@/shared/components/shadcn/aspect-ratio";
import { cn } from "@/lib/utils";
import { Images, Replace, Trash2, UploadCloud } from "lucide-react";
import saveImage from "@/features/image/api/saveImage";
import { toast } from "sonner";
import { formatKoreanDateTime } from "@/lib/util/timeFormatter";

const MAX_MB = 5;

const FormFieldHeadImage = () => {
  const { control, setValue } = useFormContext();
  const previewUrl = useWatch({ control, name: "headImagePreview" }) || "";
  const [uploading, setUploading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  return (
    <FormField
      control={control}
      name="headImage"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel>이미지 배너</FormLabel>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!field.value && !previewUrl}
                    onClick={() => {
                      setValue("headImage", "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue("headImagePreview", "", {
                        shouldDirty: true,
                        shouldValidate: false,
                      });
                      toast("이미지가 제거되었습니다.");
                    }}
                  >
                    <Trash2 className="mr-1.5 size-4" />
                    제거
                  </Button>
                </TooltipTrigger>
                <TooltipContent>현재 배너 제거</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="outline" size="sm" disabled>
                    <Images className="mr-1.5 size-4" />
                    기존 배너 선택
                  </Button>
                </TooltipTrigger>
                <TooltipContent>추가 예정</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <FormControl>
            <HeadImageUploader
              uploading={uploading}
              previewUrl={previewUrl}
              onPick={async (fileId, url) => {
                setValue("headImage", fileId, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setValue("headImagePreview", url, {
                  shouldDirty: true,
                  shouldValidate: false,
                });
              }}
              onUploading={setUploading}
              onHint={setHint}
            />
          </FormControl>

          {previewUrl && (
            <div className="mt-3 overflow-hidden rounded-md border bg-muted/30">
              <AspectRatio ratio={16 / 9}>
                <img
                  src={previewUrl}
                  alt="banner preview"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </AspectRatio>
              <div className="flex items-center justify-end gap-2 p-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        document.getElementById("head-image-input")?.click()
                      }
                      disabled={uploading}
                    >
                      <Replace className="mr-1.5 size-4" />
                      교체
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>새 이미지로 교체</TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          <div className="mt-1 text-[11px] text-muted-foreground">
            {hint ? (
              <span className="text-amber-600">{hint}</span>
            ) : (
              <>최대 {MAX_MB}MB 이미지.</>
            )}
          </div>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

function HeadImageUploader({
                             uploading,
                             previewUrl,
                             onPick,
                             onUploading,
                             onHint,
                           }: {
  uploading: boolean;
  previewUrl: string;
  onPick: (fileId: string, url: string) => void;
  onUploading: (v: boolean) => void;
  onHint: (msg: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const validate = (file: File) => {
    if (!file.type.startsWith("image/"))
      return "이미지 파일만 업로드할 수 있습니다.";
    if (file.size / 1024 / 1024 > MAX_MB)
      return `파일이 너무 큽니다. 최대 ${MAX_MB}MB 허용.`;
    return null;
  };

  const doUpload = useCallback(
    async (file: File) => {
      const err = validate(file);
      if (err) {
        onHint(err);
        toast.error(err);
        return;
      }

      onHint(null);
      onUploading(true);
      const loadingToast = toast.loading("이미지 업로드 중…");

      try {
        const { data, timestamp } = await saveImage(file);
        const { fileId, url } = data!;

        onPick(fileId, url);

        toast.success("이미지 업로드 완료", {
          id: loadingToast,
          description: formatKoreanDateTime(new Date(timestamp)),
        });
      } catch (err) {
        console.error(err);
        toast.error("이미지 업로드 실패", {
          id: loadingToast,
          description:
            (err as Error)?.message || "파일 업로드 중 문제가 발생했습니다.",
        });
        onHint("업로드 실패. 다시 시도하세요.");
      } finally {
        onUploading(false);
      }
    },
    [onHint, onPick, onUploading],
  );

  const onChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await doUpload(file);
    e.target.value = "";
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) await doUpload(file);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={cn(
        "group relative mt-2 flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-muted/20 px-4 py-10 text-center transition",
        "hover:bg-muted/30",
        uploading && "cursor-wait opacity-70",
      )}
      aria-label="배너 이미지 업로드"
    >
      <input
        id="head-image-input"
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChangeFile}
      />
      <UploadCloud className="mb-2 size-6 opacity-80" />
      <div className="text-sm font-medium">
        {uploading
          ? "업로드 중…"
          : previewUrl
            ? "이미지 교체 또는 드롭"
            : "이미지 업로드 또는 드롭"}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        클릭하거나 파일을 끌어다 놓으세요
      </div>
    </div>
  );
}

export default FormFieldHeadImage;
