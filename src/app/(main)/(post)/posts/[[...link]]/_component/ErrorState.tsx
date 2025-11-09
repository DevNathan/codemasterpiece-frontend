"use client";

import { AlertTriangle } from "lucide-react";

export default function ErrorState({
  message,
  onReload,
}: {
  message: string;
  onReload?: () => void;
}) {
  return (
    <div className="mt-16 flex flex-col items-center justify-center text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-destructive/30 blur-2xl opacity-40" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border border-destructive/50">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
      </div>

      <h2 className="text-lg font-semibold text-destructive">
        데이터를 불러오는 중 문제가 발생했습니다.
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
        {message}
      </p>

      <button
        onClick={onReload ?? (() => window.location.reload())}
        className="mt-6 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive hover:text-destructive-foreground"
      >
        새로고침
      </button>
    </div>
  );
}
