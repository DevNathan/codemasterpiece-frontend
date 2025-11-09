"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/shadcn/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      className="
        relative min-h-[100dvh] w-full
        bg-gradient-to-br from-background via-background to-muted
        flex items-center justify-center
        px-4 py-[max(12px,env(safe-area-inset-top))]
        text-foreground
      "
    >
      {/* ===== Global background accents (outside the card) ===== */}
      <div
        aria-hidden
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(60%_40%_at_50%_0%,rgba(255,255,255,0.06)_0%,transparent_70%)]
        "
      />
      <div
        aria-hidden
        className="
          pointer-events-none absolute left-1/2 top-[12%] -translate-x-1/2
          w-[85vw] max-w-[900px] h-[85vw] max-h-[900px]
          bg-gradient-to-br from-[hsl(var(--point))]/18 to-transparent
          rounded-full blur-3xl
        "
      />

      {/* ===== Stack context for glow + card ===== */}
      <div className="relative w-full max-w-[640px]">
        {/* Local glow sized to card (sits behind the card) */}
        <div
          aria-hidden
          className="
            pointer-events-none absolute inset-0 z-0
            rounded-[1.25rem]
            bg-[radial-gradient(60%_60%_at_50%_40%,rgba(255,255,255,0.10)_0%,transparent_70%)]
          "
        />
        <div
          aria-hidden
          className="
            pointer-events-none absolute z-0 left-1/2 -translate-x-1/2 -top-28
            w-[78vw] max-w-[720px] h-[78vw] max-h-[720px]
            bg-gradient-to-br from-[hsl(var(--point))]/20 to-transparent
            rounded-full blur-3xl
          "
        />

        {/* ===== Card ===== */}
        <div
          className="
            relative z-10
            w-full
            rounded-2xl border border-border/80
            bg-card/90 backdrop-blur
            shadow-xl
            px-5 py-8
            sm:px-8 sm:py-10
            text-center
          "
        >
          <div className="mx-auto flex max-w-[480px] flex-col items-center gap-3">
            <div
              className="
                inline-flex items-center justify-center
                rounded-full border border-border/70 bg-card/60
                w-12 h-12 sm:w-14 sm:h-14
              "
            >
              <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-destructive" />
            </div>

            <h1 className="text-[32px] leading-[1.1] sm:text-5xl font-extrabold tracking-tight">
              404
            </h1>

            <p className="text-base sm:text-lg font-semibold">
              페이지를 찾을 수 없습니다
            </p>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              존재하지 않거나 삭제되었거나… 길을 잃으셨군요.
            </p>
          </div>

          {/* Actions */}
          <div
            className="
              mt-6 sm:mt-8
              grid grid-cols-1 sm:grid-cols-2 gap-3
              max-w-[480px] mx-auto
            "
          >
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full"
            >
              이전 페이지로
            </Button>

            <Link href="/" className="w-full">
              <Button className="w-full">메인 페이지로</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
