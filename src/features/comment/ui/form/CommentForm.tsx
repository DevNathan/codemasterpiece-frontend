"use client";

import React, { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { AnonPref, useAnonPref } from "@/shared/hooks/useAnonPref";
import { isSuccess } from "@/lib/api/clientFetch";
import AuthHeader from "@/shared/components/commentParts/AuthHeader";
import AnonBadge from "@/shared/components/commentParts/AnonBadge";
import AvatarPicker from "@/shared/components/commentParts/AvatarPicker";
import NicknameInput from "@/shared/components/commentParts/NicknameInput";
import ContentEditor from "@/shared/components/commentParts/ContentEditor";
import SubmitBar from "@/shared/components/commentParts/SubmitBar";
import PinInput from "@/shared/components/commentParts/PinInput";

/** 아바타 이미지 경로 옵션 목록입니다. */
const avatarOptions = Array.from(
  { length: 11 },
  (_, i) =>
    `${process.env.NEXT_PUBLIC_SERVER_DOMAIN}/images/avatar/default/${i + 1}.webp`,
);

/**
 * @function findAvatarIndex
 * @description 지정된 URL에 해당하는 아바타 옵션의 인덱스를 반환합니다.
 * @param {string | null} url - 아바타 이미지 URL
 * @returns {number} 아바타 인덱스 (찾지 못할 경우 0 반환)
 */
const findAvatarIndex = (url?: string | null): number => {
  const idx = url ? avatarOptions.indexOf(url) : -1;
  return idx >= 0 ? idx : 0;
};

type Props = { parentId?: string };

/**
 * @component CommentForm
 * @description 댓글 및 대댓글 작성을 위한 메인 폼 컴포넌트입니다.
 * 사용자의 인증 상태에 따라 익명(ANON) 또는 GitHub 인증 모드로 전환됩니다.
 */
export default function CommentForm({ parentId }: Props) {
  const { user, isAuthenticated } = useAuth();
  const { postId, applyNewComment, invalidate } = useCommentContext();
  const provider: "ANON" | "GITHUB" = isAuthenticated ? "GITHUB" : "ANON";

  /** 익명 사용자 환경설정(이름, 아바타)을 로드 및 저장하는 훅입니다. */
  const [anonPref, saveAnonPref] = useAnonPref(avatarOptions.length);

  /** 현재 인증 상태에 따른 유효성 검사 스키마를 생성합니다. */
  const schema = useMemo(() => makeCommentSchema(provider), [provider]);

  /** 폼 초기화 시 사용할 기본값들을 설정합니다. */
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

  /** 인증 주체(Provider)가 변경될 때마다 폼을 초기 상태로 재설정합니다. */
  useEffect(() => {
    form.reset(defaultValues);
  }, [provider, defaultValues, form]);

  /**
   * @constant selectedAvatar
   * @description React Compiler 최적화를 위해 useWatch를 사용하여 실시간 아바타 이미지 경로를 구독합니다.
   * 기존 form.watch() 대신 useWatch를 사용함으로써 불필요한 리렌더링 및 메모이제이션 누락을 방지합니다.
   */
  const selectedAvatar = useWatch({
    control: form.control,
    name: "guestImageUrl",
  });

  /**
   * @function onSubmit
   * @description 댓글 작성을 요청하고 성공 시 캐시 갱신 및 UI 초기화를 수행합니다.
   * @param {CommentSchema} values - 제출된 폼 데이터
   */
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
      // 대댓글인 경우 캐시의 트리 구조에 직접 데이터를 추가합니다.
      await applyNewComment(data!, values.parentId || null);
    } else {
      // 루트 댓글인 경우 전체 캐시를 무효화하여 순서를 갱신합니다.
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
          "before:absolute before:-inset-0.5 before:-z-10 before:rounded-[20px]",
          "before:bg-[radial-gradient(200%_150%_at_0%_0%,var(--color-point),transparent_30%)] opacity-80",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[20px] after:ring-1 after:ring-white/5",
        )}
      >
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full mx-auto p-5 sm:p-6 space-y-6"
        >
          {/* 사용자 정보 헤더 */}
          <div className="flex items-center gap-4">
            {(isAuthenticated && !!user) ? (
              <AuthHeader user={user} />
            ) : (
              <AnonBadge />
            )}
          </div>

          {/* 익명 사용자 전용 입력 필드 (아바타, 닉네임, PIN) */}
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

          {/* 댓글 내용 편집기 */}
          <ContentEditor
            control={form.control}
            isValid={form.formState.isValid}
            onSubmitEnter={() => form.handleSubmit(onSubmit)()}
          />

          {/* 제출 및 상태 표시 바 */}
          <SubmitBar submitting={form.formState.isSubmitting} />
        </form>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-point/60 to-transparent" />
      </div>
    </Form>
  );
}
