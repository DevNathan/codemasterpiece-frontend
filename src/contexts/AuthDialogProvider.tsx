"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/shadcn/dialog";
import Link from "next/link";
import { FaGithub, FaGitlab } from "react-icons/fa";
import Logo from "@/shared/assets/logo/Logo";

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
  const [path, setPath] = useState<string>("/ ");

  const openDialog = useCallback(() => {
    const pathname = window.location.pathname || "/ ";
    const search = window.location.search || "";
    setPath(pathname + search);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => setOpen(false), []);

  const loginUrl = (provider: string) =>
    `${process.env.NEXT_PUBLIC_API_DOMAIN}/oauth2/authorization/${provider}?ruri=${encodeURIComponent(path)}`;

  return (
    <AuthDialogCtx.Provider value={{ open, openDialog, closeDialog }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-100 p-0 overflow-hidden border-none shadow-2xl bg-background">
          {/* 상단 헤더 섹션: 브랜드 아이덴티티 강조 */}
          <div className="relative h-32 bg-linear-to-br from-point/20 via-background to-accent/20 flex items-center justify-center border-b border-border/50">
            <div className="scale-150">
              <Logo />
            </div>
          </div>

          <div className="p-8">
            <DialogHeader className="items-center text-center space-y-2">
              <DialogTitle className="text-2xl font-black tracking-tighter">
                Welcome to <span className="text-point">Masterpiece</span>
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-muted-foreground">
                선호하는 플랫폼으로 간편하게 시작하세요.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-8 flex flex-col gap-3">
              {/* GitHub Login Button */}
              <Link
                href={loginUrl("github")}
                className="group relative flex items-center justify-start gap-4 px-6 py-4 rounded-2xl
                         bg-[#24292E] hover:bg-[#1B1F23] text-white
                         transition-all duration-300 shadow-md hover:shadow-xl active:scale-[0.98]"
              >
                <FaGithub className="size-6 group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-bold tracking-tight">
                  GitHub으로 계속하기
                </span>
                <div className="absolute inset-y-0 right-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </Link>

              {/* GitLab Login Button */}
              <Link
                href={loginUrl("gitlab")}
                className="group relative flex items-center justify-start gap-4 px-6 py-4 rounded-2xl
                         bg-[#FC6D26] hover:bg-[#E24329] text-white
                         transition-all duration-300 shadow-md hover:shadow-xl active:scale-[0.98]"
              >
                <FaGitlab className="size-6 group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-bold tracking-tight">
                  GitLab으로 계속하기
                </span>
                <div className="absolute inset-y-0 right-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </Link>
            </div>

            <footer className="mt-8 text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-8 bg-border" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Security First
                </span>
                <div className="h-px w-8 bg-border" />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed px-4">
                이 블로그는 별도의 개인정보를 결코 저장하지 않습니다. <br />
                오직 <b>인증(Authentication)</b>만을 위해 OAuth를 사용합니다.
              </p>
            </footer>
          </div>
        </DialogContent>
      </Dialog>
    </AuthDialogCtx.Provider>
  );
}

export function useAuthDialog() {
  const ctx = useContext(AuthDialogCtx);
  if (!ctx)
    throw new Error("useAuthDialog must be used within AuthDialogProvider");
  return ctx;
}
