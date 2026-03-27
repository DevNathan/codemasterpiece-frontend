"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PictureInPicture } from "lucide-react";

import {
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/shadcn/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/shadcn/form";
import { Input } from "@/shared/components/shadcn/input";
import { Button } from "@/shared/components/shadcn/button";

import useCategoryTree from "@/features/category/hooks/useCategoryTree";
import createCategory from "@/features/category/api/createCategory";
import {
  categorySchema,
  type CategorySchema,
} from "@/features/category/schemas/categorySchema";

import { isSuccess } from "@/lib/api/clientFetch";
import { formatKoreanDateTime } from "@/lib/util/timeFormatter";

type Props = { parentId?: string };

/**
 * @component CategoryForm
 * @description 새로운 카테고리를 추가하기 위한 입력 폼 컴포넌트입니다.
 * 리액트 19의 규율에 따라 useEffect 동기화 대신 이벤트 핸들러 중심 로직을 적용했습니다.
 */
const CategoryForm = ({ parentId }: Props) => {
  const { invalidate } = useCategoryTree();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const form = useForm<CategorySchema>({
    mode: "onChange",
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      link: "",
      image: null,
    },
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (file: File | null) => void,
  ) => {
    const file = e.target.files?.[0] ?? null;
    onChange(file);

    // 기존 URL 메모리 해제
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleLinkInput = (v: string) => {
    const lower = v.toLowerCase();
    form.setValue("link", lower, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = useCallback(
    async (data: CategorySchema) => {
      const res = await createCategory(form, {
        name: data.name,
        type: "LINK",
        parentId,
        link: data.link,
        image: data.image ?? undefined,
      });

      if (!isSuccess(res)) {
        toast.error(res.error.message, {
          description: formatKoreanDateTime(new Date(res.timestamp)),
        });
        return;
      }

      invalidate();
      toast.success(res.detail.message, {
        description: formatKoreanDateTime(new Date(res.timestamp)),
      });

      // 폼 초기화 시 프리뷰도 정리
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);

      closeRef.current?.click();
      form.reset({ name: "", link: "", image: null });
    },
    [form, invalidate, parentId, previewUrl],
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle>카테고리 추가</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form
          onSubmit={(e) => form.handleSubmit(onSubmit)(e)}
          className="space-y-6 mt-6 px-1 sm:px-0"
        >
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">
                  카테고리 이미지 (SVG)
                </FormLabel>
                <div className="flex items-center w-full gap-3">
                  <div className="size-12 rounded-md border bg-accent flex items-center justify-center overflow-hidden shrink-0">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="미리보기"
                        width={24}
                        height={24}
                        className="object-contain w-6 h-6"
                        unoptimized
                      />
                    ) : (
                      <PictureInPicture className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <FormControl className="flex-1">
                    <Input
                      type="file"
                      accept="image/svg+xml"
                      className="text-sm file:text-sm h-10"
                      onChange={(e) => handleFileChange(e, field.onChange)}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">
                  카테고리 이름
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-12 text-base"
                    placeholder="예: 데이터베이스"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">
                  카테고리 링크
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => handleLinkInput(e.target.value)}
                    className="h-12 text-base"
                    placeholder="예: database"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter className="pt-4 flex-col sm:flex-row gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                ref={closeRef}
                className="w-full sm:w-auto"
              >
                취소
              </Button>
            </DialogClose>
            <Button type="submit" className="w-full sm:w-auto">
              추가하기
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};

export default CategoryForm;
