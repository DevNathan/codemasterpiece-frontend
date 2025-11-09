"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/shadcn/dialog";
import Link from "next/link";
import { Button } from "@/shared/components/shadcn/button";

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
  const [mounted, setMounted] = useState(false);
  const [path, setPath] = useState<string>("/");

  useEffect(() => {
    setMounted(true);
    const pathname = window.location.pathname || "/";
    const search = window.location.search || "";
    setPath(pathname + search);
  }, []);

  const openDialog = useCallback(() => setOpen(true), []);
  const closeDialog = useCallback(() => setOpen(false), []);

  const ctx = useMemo<Ctx>(
    () => ({ open, openDialog, closeDialog }),
    [open, openDialog, closeDialog],
  );

  const base = process.env.NEXT_PUBLIC_API_DOMAIN ?? "";
  const loginUrl = mounted
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
            <p className="text-sm text-muted-foreground">
              GitHub 계정으로 바로 시작하세요.
            </p>
          </DialogHeader>

          <div className="mt-8 flex flex-col items-center gap-6">
            <Link
              href={loginUrl}
              aria-label="Sign in with GitHub"
              className="group flex items-center justify-center gap-3 px-6 py-3 rounded-full
                       bg-[#24292E] hover:bg-[#171A1D] text-white text-base font-semibold
                       transition-all shadow-lg hover:shadow-xl active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#24292E]"
            >
              <div className="size-8 rounded-full rounded bg-github group-hover:scale-110 transition-transform" />
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
