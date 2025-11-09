"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { AspectRatio } from "@/shared/components/shadcn/aspect-ratio";
import { Badge } from "@/shared/components/shadcn/badge";
import { Card, CardContent } from "@/shared/components/shadcn/card";
import { Eye, Heart, ImageIcon } from "lucide-react";
import { PostListDTO } from "@/features/post/type/PostListDTO";
import {
  formatToYearMonthDay,
  getTimeGapFromNow,
} from "@/lib/util/timeFormatter";
import { cn } from "@/lib/utils";

type Props = { post: PostListDTO; isEventOn: boolean };

const GridCard = ({ post, isEventOn }: Props) => {
  const tiltRef = useRef<HTMLDivElement>(null);

  const {
    slug,
    title,
    headImage,
    headContent,
    viewCount,
    likeCount,
    createdAt,
    categoryName,
    tags,
    published,
  } = post;

  const writeDate = new Date(createdAt);

  // 3D 마우스 틸트
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEventOn || !tiltRef.current) return;
    const box = tiltRef.current;
    const rect = box.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = -10 + (y / rect.height) * 20;
    const ry = 10 - (x / rect.width) * 20;

    box.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
    box.style.setProperty("--px", `${(x / rect.width) * 100}%`);
    box.style.setProperty("--py", `${(y / rect.height) * 100}%`);
  };

  const onMouseLeave = () => {
    if (!isEventOn || !tiltRef.current) return;
    const box = tiltRef.current;
    box.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
    box.style.setProperty("--px", "50%");
    box.style.setProperty("--py", "50%");
  };

  const handlers = isEventOn ? { onMouseMove, onMouseLeave } : {};

  return (
    // 외곽 비율 고정 → 내부는 h-full로 동일 높이
    <AspectRatio ratio={4 / 5} className="w-full">
      <div className="relative h-full w-full">
        <div
          className={cn("relative h-full", isEventOn && "[perspective:900px]")}
        >
          {/* 3D 래퍼: isolate로 스택 고립 + h-full */}
          <div
            ref={tiltRef}
            {...handlers}
            className={cn(
              "relative h-full rounded-2xl isolate",
              isEventOn &&
                "transition-transform duration-300 ease-out will-change-transform",
              "drop-shadow-sm hover:drop-shadow-md",
            )}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Ambient glow (카드 외곽) */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-0.5 rounded-2xl z-[1]"
              style={{
                transform: "translateZ(20px)",
                maskImage:
                  "radial-gradient(120px 80px at 20% -10%, black, transparent 60%)",
                background:
                  "radial-gradient(240px 140px at 20% -10%, color-mix(in oklab, var(--color-primary) 28%, transparent), transparent 70%)",
                opacity: 0.18,
              }}
            />

            {/* Gradient ring */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl z-[1]"
              style={{
                transform: "translateZ(18px)",
                padding: "1px",
                background:
                  "linear-gradient(180deg, color-mix(in oklab, var(--color-primary) 35%, transparent), transparent)",
                WebkitMask:
                  "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />

            {/* Glare (마우스 따라오는 빛) */}
            {isEventOn && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl h-full z-10"
                style={{
                  transform: "translateZ(22px)",
                  background:
                    "radial-gradient(340px 340px at var(--px,50%) var(--py,50%), color-mix(in oklab, var(--color-primary) 22%, transparent), transparent 60%)",
                  opacity: 0.25,
                  transition: "opacity 200ms ease",
                }}
              />
            )}

            {/* 카드 본체: z-0로 아래에 고정, 내부 균일 배치 */}
            <Card
              className={cn(
                "relative z-0 h-full overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-md",
                "flex flex-col",
                "focus-within:ring-2 focus-within:ring-primary/40",
              )}
              style={{ transform: "translateZ(10px)" }}
            >
              <Link
                href={`/post/${encodeURIComponent(slug)}`}
                className="flex h-full flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                {/* 헤더 이미지: 16:9 고정 */}
                <div className="relative">
                  <AspectRatio ratio={16 / 9} className="bg-muted">
                    {headImage ? (
                      <Image
                        src={headImage}
                        alt={title}
                        fill
                        sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                        className={cn(
                          "object-cover",
                          isEventOn &&
                            "transition-transform duration-500 group-hover:scale-[1.04]",
                        )}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </AspectRatio>

                  {/* 상단 배지 */}
                  <div className="absolute left-2 top-2 flex gap-2">
                    <Badge variant="secondary" className="shadow">
                      {categoryName}
                    </Badge>
                    {!published && (
                      <Badge variant="destructive" className="shadow">
                        PRIVATE
                      </Badge>
                    )}
                  </div>

                  {/* 하단 그라데이션 + 타이틀/시간 */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0">
                    <div className="h-20 bg-gradient-to-t from-background/85 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3">
                      <div className="flex items-end justify-between gap-3">
                        <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-foreground drop-shadow min-h-[44px]">
                          {title}
                        </h3>
                        <p className="mb-0.5 shrink-0 text-[11px] text-muted-foreground">
                          {getTimeGapFromNow(writeDate, formatToYearMonthDay)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 본문 */}
                <CardContent className="flex flex-1 flex-col gap-3 p-4">
                  {/* 요약 2줄 고정 */}
                  <p className="text-sm text-muted-foreground line-clamp-2 min-h-[44px]">
                    {headContent ?? ""}
                  </p>

                  {/* 태그 영역: 고정 높이 24px */}
                  <div className="mt-0.5 h-6">
                    {!!tags?.length ? (
                      <div className="flex h-6 flex-wrap items-center gap-1.5 overflow-hidden">
                        {tags.slice(0, 3).map((t) => (
                          <Badge
                            key={t}
                            variant="outline"
                            className="rounded-full px-2 py-0 text-[11px]"
                          >
                            #{t}
                          </Badge>
                        ))}
                        {tags.length > 3 && (
                          <Badge
                            variant="outline"
                            className="rounded-full px-2 py-0 text-[11px]"
                          >
                            +{tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="h-6" />
                    )}
                  </div>

                  <div className="my-1 h-px w-full bg-border/70" />

                  {/* 푸터 */}
                  <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {viewCount}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" />
                        {likeCount}
                      </span>
                    </div>
                    <span className="select-none rounded-md border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      Read
                    </span>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </AspectRatio>
  );
};

export default GridCard;
