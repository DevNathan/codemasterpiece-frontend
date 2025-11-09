"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/shadcn/button";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  desc: string;
  onRetry?: () => void;
  className?: string;
};

export default function ErrorState({ title, desc, onRetry, className }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-background/70 backdrop-blur",
        "p-6 sm:p-8",
        className,
      )}
    >
      {/* gradient ring */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -inset-40 bg-[conic-gradient(from_140deg,transparent,transparent,rgba(255,0,122,.25),transparent,transparent)] blur-2xl" />
      </div>

      <div className="flex items-start gap-4">
        <div className="mt-1 rounded-xl border bg-destructive/10 p-2">
          <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>

          {onRetry ? (
            <div className="mt-4">
              <Button size="sm" onClick={onRetry} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                다시 시도
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
