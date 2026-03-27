"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { PictureInPicture } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
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

/**
 * @component CategoryUpdateForm
 * @description 기존 카테고리 정보를 수정하기 위한 폼 컴포넌트입니다.
 * 렌더링 단계에서의 상태 제어와 이벤트 기반 업데이트를 통해 연쇄 렌더링을 원천 차단했습니다.
 */
export default function CategoryUpdateForm({
  category,
  onSuccessAction,
}: {
  category: CategoryDTO;
  onSuccessAction: () => void;
}) {
  const { invalidate } = useCategoryTree();
  const isLinkType = useMemo(() => category.type === "LINK", [category.type]);

  const form = useForm<CategoryUpdateSchema>({
    mode: "onChange",
    resolver: zodResolver(categoryUpdateSchema),
    defaultValues: {
      name: category.name ?? "",
      link: category.link ?? "",
      image: null,
      removeImage: false,
    },
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prevCategoryId, setPrevCategoryId] = useState(category.categoryId);

  /**
   * 카테고리 전환 시 프리뷰를 초기화합니다.
   * useEffect 대신 렌더링 단계에서 즉시 처리하여 Cascading Render를 방지합니다.
   */
  if (category.categoryId !== prevCategoryId) {
    setPrevCategoryId(category.categoryId);
    setPreviewUrl(null);
  }

  /** 이미지 삭제 여부 상태를 구독합니다. */
  const removeImage =
    useWatch({
      control: form.control,
      name: "removeImage",
    }) ?? false;

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (file: File | null) => void,
  ) => {
    const file = e.target.files?.[0] ?? null;
    onChange(file);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveImageChange = (checked: boolean) => {
    form.setValue("removeImage", checked, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (checked) {
      form.setValue("image", null, {
        shouldDirty: true,
        shouldValidate: false,
      });
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  };

  useEffect(() => {
    form.reset({
      name: category.name ?? "",
      link: category.link ?? "",
      image: null,
      removeImage: false,
    });
  }, [category, form]);

  const handleLinkInput = (v: string) => {
    const lower = v.toLowerCase();
    form.setValue("link", lower, { shouldDirty: true, shouldValidate: true });
  };

  const [loading, setLoading] = useState(false);

  const onSubmit = useCallback(
    async (values: CategoryUpdateSchema) => {
      setLoading(true);

      const res = await updateCategory(form, category.categoryId, {
        name: values.name || undefined,
        link: isLinkType ? values.link || undefined : undefined,
        image: values.removeImage ? null : values.image,
        removeImage: values.removeImage ?? false,
      });

      setLoading(false);

      if (!isSuccess(res)) {
        toast.error(res.error.message);
        return;
      }
      toast.success("카테고리가 수정되었습니다.");
      invalidate();
      onSuccessAction();
    },
    [category.categoryId, isLinkType, form, invalidate, onSuccessAction],
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle>카테고리 수정</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form
          onSubmit={(e) => form.handleSubmit(onSubmit)(e)}
          className="space-y-6 mt-6 px-1 sm:px-0"
        >
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
                          unoptimized
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
                        onChange={(e) => handleFileChange(e, field.onChange)}
                      />
                    </FormControl>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="cursor-pointer"
                        checked={removeImage}
                        onChange={(e) =>
                          handleRemoveImageChange(e.target.checked)
                        }
                      />
                      이미지 삭제
                    </label>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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
