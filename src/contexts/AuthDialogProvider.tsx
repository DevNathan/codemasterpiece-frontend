"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/shadcn/dialog";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

type Ctx = {
  open: boolean;
  openDialog: () => void;
  closeDialog: () => void;
};

const AuthDialogCtx = createContext<Ctx | null>(null);

export function AuthDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState<string>("/");

  const isClient = useSyncExternalStore(
    () => () => {}, // 구독할 외부 저장소가 없으므로 빈 함수 반환
    () => true, // 클라이언트 환경 스냅샷
    () => false, // 서버 환경 스냅샷 (Hydration mismatch 방지)
  );

  /**
   * @function openDialog
   * @description 다이얼로그를 열기 직전에 현재 경로를 낚아챕니다.
   * 불필요한 이펙트 동기화 대신, 실제 동작이 필요한 시점에 상태를 업데이트합니다.
   */
  const openDialog = useCallback(() => {
    const pathname = window.location.pathname || "/";
    const search = window.location.search || "";
    setPath(pathname + search);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => setOpen(false), []);

  const ctx = useMemo<Ctx>(
    () => ({ open, openDialog, closeDialog }),
    [open, openDialog, closeDialog],
  );

  const base = process.env.NEXT_PUBLIC_API_DOMAIN ?? "";
  const loginUrl = isClient
    ? `${base}/oauth2/authorization/github?ruri=${encodeURIComponent(path)}`
    : `${base}/oauth2/authorization/github`;

  return (
    <AuthDialogCtx.Provider value={ctx}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/80 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl p-8 text-center">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              <span className="text-point">Code</span> Masterpiece
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              GitHub 계정으로 바로 시작하세요.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-8 flex flex-col items-center gap-6">
            <Link
              href={loginUrl}
              aria-label="Sign in with GitHub"
              className="group flex items-center justify-center gap-3 px-6 py-3 rounded-full
                       bg-[#24292E] hover:bg-[#171A1D] text-white text-base font-semibold
                       transition-all shadow-lg hover:shadow-xl active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#24292E]"
            >
              <FaGithub className="size-8 group-hover:scale-110 transition-transform" />
              <span>Sign in with GitHub</span>
            </Link>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              이 블로그는 별도의 개인정보를 결코 저장하지 않습니다.
              <br className="hidden sm:block" />
              GitHub로부터 <span className="font-medium">인증</span>만 받아요.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </AuthDialogCtx.Provider>
  );
}

export function useAuthDialog() {
  const ctx = useContext(AuthDialogCtx);
  if (!ctx)
    throw new Error("useAuthDialog must be used within <AuthDialogProvider>");
  return ctx;
}
