// features/post/ui/write/WriterShell.tsx
"use client";

import React, {
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
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
import { slugifyId } from "@/lib/util/slugify";
import {
  HeadingMeta,
  HeadingProvider,
} from "@/shared/components/markdown/HeadingContext";
import { useDraft } from "@/features/post/hook/useDraft";
import { LocalStorage } from "@/shared/module/localStorage";
import { LOCALS } from "@/lib/constants/localstorages";
import { isSuccess } from "@/lib/api/clientFetch";
import { formatKoreanDateTime } from "@/lib/util/timeFormatter";

type PostFormValues = PostSchema & { headImagePreview?: string };

type PreviewPayload = {
  title: string;
  headImage: string;
  headContent: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  categoryName: string;
  categoryLink: string;
  mainContent: string;
};

function buildPreviewPayload(v: PostFormValues): PreviewPayload {
  return {
    title: v.title,
    headImage: v.headImagePreview || "",
    headContent: v.headContent,
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    published: v.published ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: v.tags ?? [],
    categoryName: "",
    categoryLink: "",
    mainContent: v.mainContent,
  };
}

const WriterShell = () => {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string | undefined;
  const isEditMode = Boolean(postId);

  const [headings, setHeadings] = useState<HeadingMeta[]>([]);
  const idCounts = useMemo(() => new Map<string, number>(), []);
  const seen = useMemo(() => new Set<string>(), []);

  const ctxValue = useMemo(
    () => ({
      allocId: (txt: string) => {
        const base = slugifyId(txt || "");
        const n = (idCounts.get(base) ?? 0) + 1;
        idCounts.set(base, n);
        return n === 1 ? base : `${base}-${n}`;
      },
      register: (h: HeadingMeta) => {
        if (!h.id || !h.text) return;
        const k = `${h.depth}:${h.id}`;
        if (seen.has(k)) return;
        seen.add(k);
        setHeadings((prev) => [...prev, h]);
      },
    }),
    [idCounts, seen],
  );

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

  const { handleSubmit, formState, watch, reset, getValues, control } = form;
  const formDirty = formState.isDirty;
  const isPublished = watch("published");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // ── 프리뷰 브릿지 ───────────────────────────────────────────────
  const previewUuidRef = useRef<string>("");
  if (!previewUuidRef.current) previewUuidRef.current = crypto.randomUUID();

  const previewKey = `${LOCALS.PREVIEW_POST_PREFIX}${previewUuidRef.current}`;
  const channelName = `${LOCALS.PREVIEW_CHAN_PREFIX}${previewUuidRef.current}`;

  const channelRef = useRef<BroadcastChannel | null>(null);
  useEffect(() => {
    if ("BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel(channelName);
    }
    return () => {
      try {
        channelRef.current?.close();
      } catch {}
      channelRef.current = null;
    };
  }, [channelName]);

  const previewDebRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const v = allValues as PostFormValues;
    const payload = buildPreviewPayload(v);

    if (previewDebRef.current) clearTimeout(previewDebRef.current);
    previewDebRef.current = setTimeout(() => {
      try {
        channelRef.current?.postMessage({ type: "snapshot", payload });
      } catch {}
      try {
        LocalStorage.setItem(previewKey, payload);
      } catch {}
    }, 200);

    return () => {
      if (previewDebRef.current) clearTimeout(previewDebRef.current);
    };
  }, [allValues, previewKey]);

  // ── 가드/네비 ───────────────────────────────────────────────────
  const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<"back" | "leave" | null>(
    null,
  );

  const isClickedFirst = useRef(false);
  const handlePopState = useCallback(() => {
    if (formDirty && !isSubmitting) {
      setPendingAction("back");
      setOpenLeaveDialog(true);
      history.pushState(null, "", "");
    } else {
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

  const handlePreview = () => {
    try {
      const payload = buildPreviewPayload(getValues());
      LocalStorage.setItem(previewKey, payload);
    } catch {}
    const url = `/preview?key=${encodeURIComponent(
      previewKey,
    )}&chan=${encodeURIComponent(channelName)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const submitImpl = async (data: PostFormValues): Promise<void> => {
    setIsSubmitting(true);
    window.onbeforeunload = null;

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
        return; // ← 반환 타입 void 유지
      }

      const {
        detail: { message },
        timestamp,
        data: resData,
      } = res;

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
        return; // ← 반환 타입 void 유지
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
    onPreview: () => handlePreview(),
    onTogglePublish: () =>
      form.setValue("published", !form.getValues("published")),
    onSubmitOverride: async (values) => {
      await submitImpl(values as PostFormValues); // ← Promise<void> 보장
    },
  });

  return (
    <HeadingProvider value={ctxValue}>
      <div className="w-full min-h-screen">
        <WriterToolbar
          isPublished={isPublished}
          isEditMode={isEditMode}
          onDraft={handleDraft}
          onPreview={handlePreview}
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
          if (pendingAction === "back") history.back();
          else router.push("/");
        }}
      />
    </HeadingProvider>
  );
};

export default WriterShell;
