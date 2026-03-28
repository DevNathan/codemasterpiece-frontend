import React from "react";
import { Button } from "@/shared/components/shadcn/button";
import { UserIcon } from "lucide-react";

type Props = {
  onLoginClick: () => void;
};

export default function HeaderGuest({ onLoginClick }: Props) {
  return (
    <div className="p-4 flex flex-col gap-3 bg-linear-to-br from-accent/50 to-transparent">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full border border-dashed border-border/80 bg-background shadow-sm">
          <UserIcon className="size-5 text-point" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold text-foreground">
            방문자님, 환영합니다
          </span>
          <span className="text-[11px] text-muted-foreground">
            개인정보 수집 없는 안전한 로그인
          </span>
        </div>
      </div>
      <Button
        size="sm"
        onClick={onLoginClick}
        className="w-full font-semibold shadow-sm"
      >
        Oauth2로 로그인하기
      </Button>
    </div>
  );
}
