"use client";
export default function FetchingBadge() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span
        className="inline-block h-3 w-3 rounded-full border-2 border-muted-foreground/40 border-t-muted-foreground animate-spin"
        aria-hidden
      />
      업데이트 중…
    </div>
  );
}
