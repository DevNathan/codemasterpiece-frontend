"use client";

import { useEffect, useMemo, useCallback, useSyncExternalStore } from "react";
import { useForm, useWatch } from "react-hook-form";
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

/**
 * @component EntryForm
 * @description 방명록 작성을 위한 폼 컴포넌트입니다. 인증 여부에 따라 입력 필드를 동적으로 전환합니다.
 */
export default function EntryForm() {
  const { user, isAuthenticated } = useAuth();
  const provider: "ANON" | "GITHUB" = isAuthenticated ? "GITHUB" : "ANON";

  const { applyNewEntry } = useGuestbook();

  const [anonPref, saveAnonPref] = useAnonPref(avatarOptions.length);

  /**
   * 클라이언트 환경 여부를 확인하기 위한 외부 스토어 동기화 훅입니다.
   * useEffect 내부의 동기적인 setState 호출(Cascading Render)을 방지하고 Hydration 무결성을 확보합니다.
   */
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

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

  /**
   * 인증 상태(provider)가 변경될 경우 폼을 초기화합니다.
   */
  useEffect(() => {
    form.reset(defaultValues);
  }, [provider, defaultValues, form]);

  /**
   * 클라이언트 환경에서 익명 사용자의 로컬 설정(이름, 아바타)을 폼에 주입합니다.
   */
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
  }, [hydrated, provider, anonPref.avatarIndex, anonPref.name, form]);

  /**
   * React Compiler 최적화 누락 방지를 위해 form.watch 대신 useWatch를 사용합니다.
   */
  const avatarSelected = useWatch({
    control: form.control,
    name: "guestImageUrl",
  });

  const persistAnonPref = useCallback(
    (values: EntrySchema) => {
      const name = (values as any).guestDisplayName?.trim() ?? "";
      const avatar = (values as any).guestImageUrl as string | undefined;
      const avatarIndex = findAvatarIndex(avatar);
      saveAnonPref({ name, avatarIndex });

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

      if (!isSuccess(res)) {
        if (res.error.code !== "error.validation") {
          toast.error(res.error.message, {
            description: formatKoreanDateTime(new Date(res.timestamp)),
          });
        }
        return;
      }

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
          "before:absolute before:-inset-0.5 before:-z-10 before:rounded-[20px]",
          "before:bg-[radial-gradient(200%_150%_at_0%_0%,var(--color-point),transparent_30%)] opacity-80",
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

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-point/60 to-transparent" />
      </div>
    </Form>
  );
}
