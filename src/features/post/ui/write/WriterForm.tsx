"use client";

import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/shadcn/form";
import { Separator } from "@/shared/components/shadcn/separator";
import FormFieldCategory from "@/features/post/ui/write/form-element/FormFieldCategory";
import FormFieldTag from "@/features/post/ui/write/form-element/FormFieldTag";
import FormFieldHeadImage from "@/features/post/ui/write/form-element/FormFieldHeadImage";
import FormFieldMainContent from "@/features/post/ui/write/form-element/FormFieldMainContent";
import { Input } from "@/shared/components/shadcn/input";
import { Textarea } from "@/shared/components/shadcn/textarea";
import { Switch } from "@/shared/components/shadcn/switch";

const WriterForm = () => (
  <div className="mx-auto max-w-5xl px-4 mt-16 pt-4 pb-8">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 좌측 */}
      <div className="space-y-6">
        <FormFieldCategory />
        <FormFieldTag />
        <FormField
          name="published"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-md border p-3">
              <div>
                <FormLabel>공개 발행</FormLabel>
                <div className="text-xs text-muted-foreground">
                  비활성화 시 비공개 저장
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* 우측 */}
      <div className="lg:col-span-2 space-y-6">
        <FormField
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input placeholder="제목을 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormFieldHeadImage />
        <FormField
          name="headContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>짧은 글 (요약)</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="포스트 요약을 입력하세요"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>

    <FormFieldMainContent className="pt-4" />
    <Separator className="my-8" />
  </div>
);

export default WriterForm;
