"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/shadcn/command";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

const MobileSearch = ({ open, onOpenChange }: Props) => {
  const router = useRouter();

  // 렌더 결정성 보존: 초기값은 빈 문자열, 마운트 후 URL에서 ?k= 주입
  const [local, setLocal] = useState("");

  const submit = () => {
    const q = local.trim();
    if (!q) return;
    router.push(`/posts?k=${encodeURIComponent(q)}`);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        value={local}
        onValueChange={setLocal}
        placeholder="검색어를 입력하세요."
        // shadcn CommandInput은 onKeyDown으로 Enter 핸들 가능
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") onOpenChange(false);
        }}
      />
      <CommandList>
        <CommandEmpty>검색어를 입력하세요.</CommandEmpty>

        <CommandGroup heading="추천">
          <CommandItem
            onSelect={(v) => {
              setLocal(v);
              setTimeout(submit, 0);
            }}
          >
            Next.js
          </CommandItem>
          <CommandItem
            onSelect={(v) => {
              setLocal(v);
              setTimeout(submit, 0);
            }}
          >
            Spring Boot
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default MobileSearch;
