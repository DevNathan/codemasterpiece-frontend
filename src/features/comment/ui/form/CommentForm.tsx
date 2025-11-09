"use client";

import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/UserContext";
import {
  CommentSchema,
  makeCommentSchema,
} from "@/features/comment/schemas/commentSchema";
import { Form } from "@/shared/components/shadcn/form";
import { cn } from "@/lib/utils";
import createComment from "@/features/comment/api/createComment";
import { useCommentContext } from "@/features/comment/context/CommentContext";
import { toast } from "sonner";
import { formatKoreanDateTime } from "@/lib/util/timeFormatter";

// parts
import AuthHeader from "../../../../shared/components/commentParts/AuthHeader";
import AnonBadge from "../../../../shared/components/commentParts/AnonBadge";
import AvatarPicker from "../../../../shared/components/commentParts/AvatarPicker";
import NicknameInput from "../../../../shared/components/commentParts/NicknameInput";
import PinInput from "../../../../shared/components/commentParts/PinInput";
import ContentEditor from "../../../../shared/components/commentParts/ContentEditor";
import SubmitBar from "../../../../shared/components/commentParts/SubmitBar";
import { AnonPref, useAnonPref } from "@/shared/hooks/useAnonPref";
import { isSuccess } from "@/lib/api/clientFetch";

const avatarOptions = Array.from(
  { length: 11 },
  (_, i) =>
    `${process.env.NEXT_PUBLIC_SERVER_DOMAIN}/images/avatar/default/${i + 1}.webp`,
);

const findAvatarIndex = (url?: string | null) => {
  const idx = url ? avatarOptions.indexOf(url) : -1;
  return idx >= 0 ? idx : 0;
};

type Props = { parentId?: string };

export default function CommentForm({ parentId }: Props) {
  const { user, isAuthenticated } = useAuth();
  const { postId, applyNewComment, invalidate } = useCommentContext();
  const provider: "ANON" | "GITHUB" = isAuthenticated ? "GITHUB" : "ANON";

  // 익명 기본값 로딩/저장 훅
  const [anonPref, saveAnonPref] = useAnonPref(avatarOptions.length);

  // 스키마/디폴트
  const schema = useMemo(() => makeCommentSchema(provider), [provider]);
  const defaultValues = useMemo(
    () =>
      provider === "ANON"
        ? ({
            postId,
            parentId: parentId ?? "",
            content: "",
            guestDisplayName: anonPref.name || "",
            guestImageUrl:
              avatarOptions[anonPref.avatarIndex] ?? avatarOptions[0],
            guestPin: "",
          } as CommentSchema)
        : ({
            postId,
            parentId: parentId ?? "",
            content: "",
          } as CommentSchema),
    [provider, postId, parentId, anonPref.name, anonPref.avatarIndex],
  );

  const form = useForm<CommentSchema>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues,
  });

  // provider 변경 시 reset
  useEffect(() => {
    form.reset(defaultValues);
  }, [provider, defaultValues, form]);

  const selectedAvatar = form.watch("guestImageUrl");

  // 제출
  const onSubmit = async (values: CommentSchema) => {
    const res = await createComment(form, values);

    if (!isSuccess(res)) {
      const {
        error: { message, code },
        timestamp,
      } = res;
      if (code != "error.validation") {
        toast.error(message, {
          description: formatKoreanDateTime(new Date(timestamp)),
        });
      }
      return;
    }

    if (provider === "ANON") {
      const name = (values as any).guestDisplayName?.trim() ?? "";
      const url = (values as any).guestImageUrl as string | undefined;
      const avatarIndex = findAvatarIndex(url);
      const nextPref: AnonPref = { name, avatarIndex };
      saveAnonPref(nextPref);

      form.reset({
        postId,
        parentId: parentId ?? "",
        content: "",
        guestDisplayName: name,
        guestImageUrl: avatarOptions[avatarIndex],
        guestPin: "",
      } as CommentSchema);
    } else {
      form.reset({
        postId,
        parentId: parentId ?? "",
        content: "",
      } as CommentSchema);
    }

    const {
      detail: { message },
      timestamp,
      data,
    } = res;

    const isReply = !!values.parentId && values.parentId.length > 0;
    if (isReply) {
      await applyNewComment(data!, values.parentId || null);
    } else {
      await invalidate();
    }

    toast.success(message, {
      description: formatKoreanDateTime(new Date(timestamp)),
    });
  };

  return (
    <Form key={provider} {...form}>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "border border-border/60 bg-background/70 backdrop-blur-xl",
          "shadow-[0_10px_40px_rgba(0,0,0,0.15)] ring-1 ring-black/5",
          "before:absolute before:inset-[-2px] before:-z-10 before:rounded-[20px]",
          "before:bg-[radial-gradient(120%_120%_at_0%_0%,theme(colors.point/30),transparent_55%)]",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[20px] after:ring-1 after:ring-white/5",
        )}
      >
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full mx-auto p-5 sm:p-6 space-y-6"
        >
          {/* 헤더 */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <AuthHeader user={user as any} />
            ) : (
              <AnonBadge />
            )}
          </div>

          {/* 익명 입력 그리드 */}
          {provider === "ANON" && (
            <div className="grid gap-4 items-start sm:grid-cols-[56px_minmax(0,1fr)_minmax(0,1fr)]">
              <AvatarPicker
                value={selectedAvatar ?? avatarOptions[0]}
                options={avatarOptions}
                onChange={(src) =>
                  form.setValue("guestImageUrl", src, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              />
              <div className="flex justify-center items-center gap-2">
                <NicknameInput control={form.control} />
                <PinInput control={form.control} />
              </div>
            </div>
          )}

          {/* 내용 */}
          <ContentEditor
            control={form.control}
            isValid={form.formState.isValid}
            onSubmitEnter={() => form.handleSubmit(onSubmit)()}
          />

          {/* 액션 */}
          <SubmitBar submitting={form.formState.isSubmitting} />
        </form>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-point/60 to-transparent" />
      </div>
    </Form>
  );
}
