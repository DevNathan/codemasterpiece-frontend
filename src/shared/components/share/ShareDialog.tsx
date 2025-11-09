"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/shadcn/dialog";
import { Input } from "@/shared/components/shadcn/input";
import { Button } from "@/shared/components/shadcn/button";
import { Separator } from "@/shared/components/shadcn/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/shadcn/tooltip";
import { toast } from "sonner";
import { Check, Copy, Link as LinkIcon, Share2 } from "lucide-react";
import { SiFacebook, SiLinkedin, SiX } from "react-icons/si";
import { cn } from "@/lib/utils";

type ShareDialogProps = {
  // Trigger 버튼 커스텀
  buttonVariant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonAriaLabel?: string;
  buttonClassName?: string;
  // Tooltip 옵션
  tooltip?: {
    side?: "top" | "right" | "bottom" | "left";
    delay?: number;
    label?: string;
  };
  // 카드 쉘 커스텀
  contentClassName?: string;
};

const ShareDialog: React.FC<ShareDialogProps> = ({
  buttonVariant = "secondary",
  buttonSize = "icon",
  buttonAriaLabel = "공유",
  buttonClassName,
  tooltip = { side: "top", delay: 100, label: "공유" },
  contentClassName,
}) => {
  // === 기존 usePathname/useSearchParams 제거, 런타임에서만 URL 생성 ===
  const [currentUrl, setCurrentUrl] = React.useState("");
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const { origin, pathname, search } = window.location;
      setCurrentUrl(`${origin}${pathname}${search || ""}`);
    }
  }, []);

  const [copied, setCopied] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleCopy = async () => {
    if (!currentUrl) return;

    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast.success("링크를 복사했습니다.");
    } catch {
      toast.error("복사 실패. 브라우저 권한을 확인하세요.");
    } finally {
      setTimeout(() => setCopied(false), 1200);
    }
  };

  const openWin = (url: string) =>
    window.open(url, "_blank", "noopener,noreferrer,width=700,height=600");

  const shareX = () =>
    openWin(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(document.title)}&url=${encodeURIComponent(currentUrl)}`,
    );
  const shareFb = () =>
    openWin(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    );
  const shareLi = () =>
    openWin(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    );

  return (
    <Dialog>
      {/* 래핑 순서 고정 */}
      <Tooltip delayDuration={tooltip?.delay ?? 100}>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant={buttonVariant}
              size={buttonSize}
              aria-label={buttonAriaLabel}
              className={cn(
                "h-11 w-11 rounded-full hover:scale-[1.03] active:scale-95 cursor-pointer",
                buttonClassName,
              )}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side={tooltip?.side ?? "top"}>
          {tooltip?.label ?? "공유"}
        </TooltipContent>
      </Tooltip>

      {/* 중앙 정렬은 shadcn 기본값 유지 → 외형은 내부 쉘에서 */}
      <DialogContent className="sm:max-w-lg p-0 bg-transparent border-none shadow-none">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl",
            "border border-border/60 bg-background/70 backdrop-blur-xl",
            "shadow-2xl ring-1 ring-black/5",
            "before:absolute before:inset-[-2px] before:-z-10 before:rounded-[22px]",
            "before:bg-[radial-gradient(120%_120%_at_0%_0%,theme(colors.primary/30),transparent_50%)]",
            "after:pointer-events-none after:absolute after:inset-0 after:rounded-[22px] after:ring-1 after:ring-white/5",
            contentClassName,
          )}
        >
          <div className="p-4 sm:p-6">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-center text-base sm:text-lg tracking-tight flex items-center gap-2 justify-center">
                <LinkIcon className="h-4 w-4 opacity-80" />
                현재 페이지 공유하기
              </DialogTitle>
              <DialogDescription className="text-center text-xs sm:text-sm text-muted-foreground">
                링크를 복사하거나 소셜로 바로 공유하세요.
              </DialogDescription>
            </DialogHeader>

            {/* URL 박스 */}
            <div className="group relative mt-3 rounded-xl border border-border/70 bg-gradient-to-b from-background/80 to-background/60 shadow-sm">
              <div className="flex items-stretch gap-2 p-2">
                <Input
                  ref={inputRef}
                  readOnly
                  value={currentUrl}
                  onFocus={(e) => e.currentTarget.select()}
                  className="text-xs sm:text-sm border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none bg-transparent"
                  aria-readonly="true"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={copied ? "secondary" : "default"}
                      size="sm"
                      onClick={handleCopy}
                      className="whitespace-nowrap"
                    >
                      {copied ? (
                        <>
                          <Check className="mr-1 h-4 w-4" />
                          복사됨
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-4 w-4" />
                          복사
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    클릭 한 번으로 복사합니다.
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            </div>

            {/* 소셜 */}
            <div className="mt-4">
              <Separator className="mb-3" />
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareX}
                      className="gap-2 hover:shadow"
                    >
                      <SiX className="h-4 w-4" /> X
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    X(Twitter)로 공유
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareFb}
                      className="gap-2 hover:shadow"
                    >
                      <SiFacebook className="h-4 w-4" /> Facebook
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Facebook으로 공유
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareLi}
                      className="gap-2 hover:shadow"
                    >
                      <SiLinkedin className="h-4 w-4" /> LinkedIn
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    LinkedIn으로 공유
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
