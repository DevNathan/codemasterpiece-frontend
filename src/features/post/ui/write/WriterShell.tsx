"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PostSchema, postSchema } from "@/features/post/schemas/postSchema";
import { toast } from "sonner";
import { usePostFormInit } from "@/features/post/hook/usePostFormInit";
import { useBeforeUnloadGuard } from "@/features/post/hook/useBeforeUnload";
import { useKeyboardShortcuts } from "@/features/post/hook/useKeyboardShortcuts";
import WriterToolbar from "@/features/post/ui/write/WriterToolbar";
import WriterForm from "@/features/post/ui/write/WriterForm";
import LeaveConfirmDialog from "@/features/post/ui/write/LeaveConfirmDialog";
import createPost from "@/features/post/api/createPost";
import updatePost from "@/features/post/api/updatePost";
import { useDraft } from "@/features/post/hook/useDraft";
import { isSuccess } from "@/lib/api/clientFetch";
import { formatKoreanDateTime } from "@/lib/util/timeFormatter";
import { invalidatePostCacheAction } from "@/features/post/action/cacheAction";

type PostFormValues = PostSchema & { headImagePreview?: string };

const WriterShell = () => {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string | undefined;
  const isEditMode = Boolean(postId);

  const form = useForm<PostFormValues>({
    mode: "onChange",
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      categoryId: "",
      headImage: "",
      headImagePreview: "",
      headContent: "",
      tags: [],
      mainContent: "",
      published: false,
    },
  });

  const { handleSubmit, formState, reset, getValues, control } = form;
  const formDirty = formState.isDirty;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPublished = useWatch({
    control,
    name: "published",
    defaultValue: false,
  });

  // 초기 데이터 주입(수정 모드)
  usePostFormInit({ postId, isEditMode, reset });

  // ── 임시저장 ─────────────────────────────────────────────────────
  const { scheduleAutosave, saveNow, tryRestore, clear } = useDraft({
    postId,
    getValues,
    reset,
  });
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    const restored = tryRestore();
    if (restored) toast("임시 저장본을 복원했습니다.");
    restoredRef.current = true;
  }, [tryRestore]);

  const allValues = useWatch({ control });
  useEffect(() => {
    if (isSubmitting) return;
    scheduleAutosave(allValues as PostFormValues, 1200);
  }, [allValues, isSubmitting, scheduleAutosave]);

  // ── 가드/네비 ───────────────────────────────────────────────────
  const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<"back" | "leave" | null>(
    null,
  );

  const isClickedFirst = useRef(false);

  /* 사용자가 실제로 페이지를 이탈할 때 popstate 이벤트를 무시하기 위한 플래그입니다. */
  const bypassTrap = useRef(false);

  const handlePopState = useCallback(() => {
    /* 이탈이 확정된 상태라면, 추가적인 가드 로직을 실행하지 않고 통과시킵니다. */
    if (bypassTrap.current) return;

    if (formDirty && !isSubmitting) {
      setPendingAction("back");
      setOpenLeaveDialog(true);
      /* 사용자를 붙잡기 위해 가짜 상태를 history에 추가합니다. */
      history.pushState(null, "", "");
    } else {
      /* 폼이 수정되지 않은 상태라도 가짜 상태(dummy)에서 뒤로 온 것이므로,
         원래 페이지로 돌아가기 위해 한 번 더 뒤로가기를 실행합니다. */
      bypassTrap.current = true;
      history.back();
    }
  }, [formDirty, isSubmitting]);

  useEffect(() => {
    if (!isClickedFirst.current) {
      history.pushState(null, "", "");
      isClickedFirst.current = true;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [handlePopState]);

  useBeforeUnloadGuard(formDirty && !isSubmitting);

  // ── 버튼 핸들러 ─────────────────────────────────────────────────
  const handleDraft = () => {
    saveNow(allValues as PostFormValues);
    toast.success("임시 저장 완료.");
  };

  const submitImpl = async (data: PostFormValues): Promise<void> => {
    setIsSubmitting(true);

    if (isEditMode) {
      const payload = {
        title: data.title,
        headImage: data.headImage?.trim() ? data.headImage.trim() : null,
        headContent: data.headContent?.trim() || null,
        tags: data.tags,
        categoryId: data.categoryId,
        mainContent: data.mainContent,
        published: data.published,
      };
      const res = await updatePost(form, postId!, payload);

      if (!isSuccess(res)) {
        setIsSubmitting(false);
        const {
          error: { message },
          timestamp,
        } = res;
        toast.error(message, {
          description: formatKoreanDateTime(new Date(timestamp)),
        });
        return;
      }

      const {
        detail: { message },
        timestamp,
        data: resData,
      } = res;

      try {
        await invalidatePostCacheAction(resData!.slug);
      } catch (e) {
        console.error("캐시 해제 중 오류가 발생했습니다.", e);
      }

      toast.success(message, {
        description: formatKoreanDateTime(new Date(timestamp)),
      });
      (form as any).reset(form.getValues(), { keepDirty: false });
      clear();
      router.push(`/post/${resData!.slug}`);
    } else {
      const res = await createPost(form, data);

      if (!isSuccess(res)) {
        setIsSubmitting(false);
        const {
          error: { message },
          timestamp,
        } = res;
        toast.error(message, {
          description: formatKoreanDateTime(new Date(timestamp)),
        });
        return;
      }

      const {
        detail: { message },
        timestamp,
        data: slug,
      } = res;

      toast.success(message, {
        description: formatKoreanDateTime(new Date(timestamp)),
      });
      (form as any).reset(form.getValues(), { keepDirty: false });
      clear();
      router.push(slug ? `/post/${slug}` : "/");
    }
  };

  const handleNavigateHome = () => {
    if (formDirty && !isSubmitting) {
      setPendingAction("leave");
      setOpenLeaveDialog(true);
    } else {
      router.push("/");
    }
  };

  // ── 단축키 연결 (충돌 없는 키 세트) ─────────────────────────────
  useKeyboardShortcuts(form, handleSubmit, router, {
    onDraft: () => handleDraft(),
    onTogglePublish: () =>
      form.setValue("published", !form.getValues("published")),
    onSubmitOverride: async (values) => {
      await submitImpl(values as PostFormValues);
    },
  });

  return (
    <>
      <div className="w-full min-h-screen">
        <WriterToolbar
          isPublished={isPublished}
          isEditMode={isEditMode}
          onDraft={handleDraft}
          onSubmit={handleSubmit(submitImpl)}
          onNavigateHome={handleNavigateHome}
        />
        <FormProvider {...form}>
          <WriterForm />
        </FormProvider>
      </div>

      <LeaveConfirmDialog
        open={openLeaveDialog}
        onCancel={() => {
          setOpenLeaveDialog(false);
          setPendingAction(null);
        }}
        onConfirm={() => {
          setOpenLeaveDialog(false);
          if (pendingAction === "back") {
            bypassTrap.current = true;
            window.history.back();
            setTimeout(() => {
              router.back();
            }, 50);
          } else {
            router.push("/");
          }
        }}
      />
    </>
  );
};

export default WriterShell;
