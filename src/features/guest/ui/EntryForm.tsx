"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/contexts/UserContext";
import { Form } from "@/shared/components/shadcn/form";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatKoreanDateTime } from "@/lib/util/timeFormatter";

import { useAnonPref } from "@/shared/hooks/useAnonPref";
import AuthHeader from "@/shared/components/commentParts/AuthHeader";
import AnonBadge from "@/shared/components/commentParts/AnonBadge";
import AvatarPicker from "@/shared/components/commentParts/AvatarPicker";
import NicknameInput from "@/shared/components/commentParts/NicknameInput";
import PinInput from "@/shared/components/commentParts/PinInput";
import ContentEditor from "@/shared/components/commentParts/ContentEditor";
import SubmitBar from "@/shared/components/commentParts/SubmitBar";

import {
  EntrySchema,
  makeEntrySchema,
} from "@/features/guest/schemas/entrySchema";
import createEntry from "@/features/guest/api/createEntry";
import { isSuccess } from "@/lib/api/clientFetch";
import { useGuestbook } from "@/features/guest/context/GuestbookContext";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const avatarOptions = Array.from(
  { length: 11 },
  (_, i) =>
    `${process.env.NEXT_PUBLIC_SERVER_DOMAIN}/images/avatar/default/${i + 1}.webp`,
);
const FALLBACK_AVATAR = avatarOptions[0];

const findAvatarIndex = (url?: string | null) => {
  const idx = url ? avatarOptions.indexOf(url) : -1;
  return idx >= 0 ? idx : 0;
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function EntryForm() {
  const { user, isAuthenticated } = useAuth();
  const provider: "ANON" | "GITHUB" = isAuthenticated ? "GITHUB" : "ANON";

  const { applyNewEntry } = useGuestbook();

  // 클라 프리퍼런스
  const [anonPref, saveAnonPref] = useAnonPref(avatarOptions.length);

  // 하이드레이션 플래그
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // 스키마 / 기본값
  const schema = useMemo(() => makeEntrySchema(provider), [provider]);

  const defaultValues = useMemo<EntrySchema>(() => {
    if (provider === "ANON") {
      return {
        content: "",
        guestDisplayName: "",
        guestImageUrl: FALLBACK_AVATAR,
        guestPin: "",
      } as EntrySchema;
    }
    return { content: "" } as EntrySchema;
  }, [provider]);

  const form = useForm<EntrySchema>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues,
  });

  // provider가 바뀌면 공통 안전 초기값으로 리셋(SSR/CSR 불일치 방지)
  useEffect(() => {
    form.reset(defaultValues);
  }, [provider, defaultValues]);

  // 하이드레이션 이후, ANON일 때만 로컬 프리퍼런스 주입
  useEffect(() => {
    if (!hydrated || provider !== "ANON") return;
    const name = anonPref.name?.trim() ?? "";
    const avatar = avatarOptions[anonPref.avatarIndex] ?? FALLBACK_AVATAR;
    form.reset({
      content: "",
      guestDisplayName: name,
      guestImageUrl: avatar,
      guestPin: "",
    } as EntrySchema);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, provider, anonPref.avatarIndex, anonPref.name]);

  const avatarSelected = form.watch("guestImageUrl");

  const persistAnonPref = useCallback(
    (values: EntrySchema) => {
      const name = (values as any).guestDisplayName?.trim() ?? "";
      const avatar = (values as any).guestImageUrl as string | undefined;
      const avatarIndex = findAvatarIndex(avatar);
      saveAnonPref({ name, avatarIndex });

      // 프리퍼런스 반영한 상태로 폼 초기화
      form.reset({
        content: "",
        guestDisplayName: name,
        guestImageUrl: avatarOptions[avatarIndex],
        guestPin: "",
      } as EntrySchema);
    },
    [form, saveAnonPref],
  );

  const resetGithubForm = useCallback(() => {
    form.reset({ content: "" } as EntrySchema);
  }, [form]);

  const onSubmit = useCallback(
    async (values: EntrySchema) => {
      const res = await createEntry(form, values);

      // 실패: validation은 이미 RHF로 세팅됨. 그 외만 토스트.
      if (!isSuccess(res)) {
        if (res.error.code !== "error.validation") {
          toast.error(res.error.message, {
            description: formatKoreanDateTime(new Date(res.timestamp)),
          });
        }
        return;
      }

      // 성공
      const { data, detail, timestamp } = res;
      applyNewEntry(data!);

      if (provider === "ANON") {
        persistAnonPref(values);
      } else {
        resetGithubForm();
      }

      toast.success(detail.message, {
        description: formatKoreanDateTime(new Date(timestamp)),
      });
    },
    [form, applyNewEntry, provider, persistAnonPref, resetGithubForm],
  );

  return (
    <Form key={provider} {...form}>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/60 bg-background/70 backdrop-blur-xl",
          "shadow-[0_10px_40px_rgba(0,0,0,0.15)] ring-1 ring-black/5",
          "before:absolute before:inset-[-2px] before:-z-10 before:rounded-[20px]",
          "before:bg-[radial-gradient(120%_120%_at_0%_0%,theme(colors.point/30),transparent_55%)]",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[20px] after:ring-1 after:ring-white/5",
        )}
      >
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto w-full space-y-6 p-5 sm:p-6"
        >
          {/* Auth strip */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <AuthHeader user={user as any} />
            ) : (
              <AnonBadge />
            )}
          </div>

          {/* ANON fields */}
          {provider === "ANON" && (
            <div className="grid items-start gap-4 sm:grid-cols-[56px_1fr_1fr]">
              {hydrated ? (
                <AvatarPicker
                  value={avatarSelected ?? FALLBACK_AVATAR}
                  options={avatarOptions}
                  onChange={(src) =>
                    form.setValue("guestImageUrl", src, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-muted" />
              )}
              <NicknameInput control={form.control} />
              <PinInput control={form.control} />
            </div>
          )}

          {/* Content */}
          <ContentEditor
            control={form.control}
            isValid={form.formState.isValid}
            onSubmitEnter={() => form.handleSubmit(onSubmit)()}
          />

          <SubmitBar submitting={form.formState.isSubmitting} />
        </form>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-point/60 to-transparent" />
      </div>
    </Form>
  );
}
