"use client";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/shadcn/dropdown-menu";
import { cn } from "@/lib/utils";
import { Camera } from "lucide-react";

export default function AvatarPicker({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (url: string) => void;
}) {
  return (
    <div className="flex flex-col items-center sm:items-start">
      <DropdownMenu>
        <div className="relative inline-block">
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="아바타 선택"
              className={cn(
                "relative h-14 w-14 rounded-full overflow-hidden",
                "ring-2 ring-point/40 hover:ring-point/60 transition-all",
                "shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-point",
              )}
            >
              <Image
                src={value}
                alt="선택된 아바타"
                fill
                sizes="56px"
                className="object-cover"
              />
            </button>
          </DropdownMenuTrigger>
          <span className="pointer-events-none absolute -bottom-1 -right-1 z-10 rounded-full bg-background/95 border px-1.5 py-0.5 text-[10px] leading-none flex items-center gap-1 shadow-sm">
            <Camera className="h-3 w-3" />
            변경
          </span>
        </div>
        <DropdownMenuContent
          align="start"
          className="grid grid-cols-4 gap-2 p-2 w-[232px]"
        >
          {options.map((src, idx) => (
            <DropdownMenuItem
              key={src}
              className="p-1"
              onClick={() => onChange(src)}
            >
              <div className="relative">
                <Image
                  src={src}
                  alt={`avatar-${idx + 1}`}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full ring-1 ring-border object-cover"
                />
                {value === src && (
                  <span className="absolute inset-0 rounded-full ring-2 ring-point/70" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="mt-1 text-[11px] text-muted-foreground">아바타</span>
    </div>
  );
}
