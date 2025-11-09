"use client";

import { useEffect, useRef, useState } from "react";
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

  // 실시간 이미지 미리보기
  const imageValue = form.watch("image");
  useEffect(() => {
    if (imageValue instanceof File) {
      const url = URL.createObjectURL(imageValue);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [imageValue]);

  // 소문자 강제 UX 보조 (스키마도 변환하지만, 입력 UX도 깔끔하게)
  const handleLinkInput = (v: string) => {
    const lower = v.toLowerCase();
    form.setValue("link", lower, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = async (data: CategorySchema) => {
    const res = await createCategory(form, {
      name: data.name,
      type: "LINK",
      parentId,
      link: data.link,              // 스키마에서 이미 lowercase 변환
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

    closeRef.current?.click();
    form.reset({ name: "", link: "", image: null });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>카테고리 추가</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6 px-1 sm:px-0">
          {/* 이미지 업로드 */}
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">카테고리 이미지 (SVG)</FormLabel>
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
                    ) : (
                      <PictureInPicture className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <FormControl className="flex-1">
                    <Input
                      type="file"
                      accept="image/svg+xml"
                      className="text-sm file:text-sm h-10"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        field.onChange(file);
                      }}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 카테고리 이름 */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">카테고리 이름</FormLabel>
                <FormControl>
                  <Input {...field} className="h-12 text-base" placeholder="예: 데이터베이스" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 링크 입력 */}
          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">카테고리 링크</FormLabel>
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

          {/* 버튼 */}
          <DialogFooter className="pt-4 flex-col sm:flex-row gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="secondary" ref={closeRef} className="w-full sm:w-auto">
                취소
              </Button>
            </DialogClose>
            <Button type="submit" className="w-full sm:w-auto">추가하기</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};

export default CategoryForm;
