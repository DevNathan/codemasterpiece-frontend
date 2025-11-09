"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="mt-24 flex flex-col items-center justify-center text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-muted/40 blur-xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>

      <h2 className="text-lg font-semibold text-foreground">
        게시글이 존재하지 않습니다.
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
        현재 선택하신 조건에 맞는 게시글이 없습니다. 정렬 기준을 변경하시거나
        다른 분류를 선택해보시기 바랍니다.
      </p>

      <Link
        href="/posts"
        className="mt-6 rounded-md border border-border bg-background/40 px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground"
      >
        전체 게시글 보기
      </Link>
    </div>
  );
}
