"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { PictureInPicture } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import updateCategory from "@/features/category/api/updateCategory";
import useCategoryTree from "@/features/category/hooks/useCategoryTree";
import type { CategoryDTO } from "@/features/category/types/CategoryDTO";
import { isSuccess } from "@/lib/api/clientFetch";

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
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/shadcn/dialog";

import {
  categoryUpdateSchema,
  type CategoryUpdateSchema,
} from "@/features/category/schemas/categoryUpdateSchema";

export default function CategoryUpdateForm({
  category,
  onSuccess,
}: {
  category: CategoryDTO;
  onSuccess: () => void;
}) {
  const { invalidate } = useCategoryTree();
  const isLinkType = useMemo(() => category.type === "LINK", [category.type]);

  const form = useForm<CategoryUpdateSchema>({
    mode: "onChange",
    resolver: zodResolver(categoryUpdateSchema),
    defaultValues: {
      name: category.name ?? "", // 빈 문자열도 스키마에서 undefined로 정규화됨
      link: category.link ?? "",
      image: null,
      removeImage: false,
    },
  });

  // 미리보기: 신규 파일 > 기존 이미지 > 아이콘
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileValue = form.watch("image");
  const removeImage = form.watch("removeImage") ?? false;

  useEffect(() => {
    if (fileValue instanceof File) {
      const url = URL.createObjectURL(fileValue);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [fileValue]);

  // 카테고리 변경 시 상태 초기화
  useEffect(() => {
    form.reset({
      name: category.name ?? "",
      link: category.link ?? "",
      image: null,
      removeImage: false,
    });
    setPreviewUrl(null);
  }, [category.categoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  // link 소문자 보조
  const handleLinkInput = (v: string) => {
    const lower = v.toLowerCase();
    form.setValue("link", lower, { shouldDirty: true, shouldValidate: true });
  };

  // 제출
  const [loading, setLoading] = useState(false);
  const onSubmit = async (values: CategoryUpdateSchema) => {
    setLoading(true);

    const res = await updateCategory(form, category.categoryId, {
      name: values.name || undefined,
      link: isLinkType ? values.link || undefined : undefined, // FOLDER면 전송 안 함
      image: values.removeImage ? null : values.image, // removeImage면 null
      removeImage: values.removeImage ?? false,
    });

    setLoading(false);

    if (!isSuccess(res)) {
      toast.error(res.error.message);
      return;
    }
    toast.success("카테고리가 수정되었습니다.");
    invalidate();
    onSuccess();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>카테고리 수정</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 mt-6 px-1 sm:px-0"
        >
          {/* 이미지 업로드 영역 (LINK 타입 전용) */}
          {isLinkType && (
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">
                    카테고리 이미지
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
                        />
                      ) : category.imagePath && !removeImage ? (
                        <Image
                          src={category.imagePath}
                          alt="현재 이미지"
                          width={24}
                          height={24}
                          className="object-contain w-6 h-6"
                        />
                      ) : (
                        <PictureInPicture className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>

                    <FormControl className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        className="text-sm file:text-sm h-10"
                        disabled={removeImage}
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          field.onChange(f);
                        }}
                      />
                    </FormControl>
                  </div>

                  {/* 이미지 삭제 체크 */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={removeImage}
                        onChange={(e) => {
                          form.setValue("removeImage", e.target.checked, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                          if (e.target.checked) {
                            form.setValue("image", null, {
                              shouldDirty: true,
                              shouldValidate: false,
                            });
                            setPreviewUrl(null);
                          }
                        }}
                      />
                      이미지 삭제
                    </label>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* 이름 */}
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
                    value={field.value ?? ""}
                    className="h-12 text-base"
                    placeholder="새 이름 입력"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 링크 (LINK 타입에만) */}
          {isLinkType && (
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
          )}

          {/* 버튼 */}
          <DialogFooter className="pt-4 flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
