"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { AspectRatio } from "@/shared/components/shadcn/aspect-ratio";
import { Badge } from "@/shared/components/shadcn/badge";
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

  // 3D 마우스 틸트 로직
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEventOn || !tiltRef.current) return;
    const box = tiltRef.current;
    const rect = box.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 회전 각도 계산
    const rx = -10 + (y / rect.height) * 20;
    const ry = 10 - (x / rect.width) * 20;

    box.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
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
    <AspectRatio ratio={4 / 5} className="w-full">
      {/* Perspective Wrapper */}
      <div className={cn("relative w-full h-full", isEventOn && "[perspective:1000px]")}>
        <div
          ref={tiltRef}
          {...handlers}
          className={cn(
            "relative w-full h-full isolate",
            isEventOn && "transition-transform duration-300 ease-out will-change-transform",
            "hover:z-10" // 호버 시 z-index 상승으로 잘림 방지
          )}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* =========================================================
              Layer 1: 그림자 및 후광 효과 (장식용)
              Link 바깥에 배치하여 컨텐츠 간섭 최소화
             ========================================================= */}

          {/* Ambient Shadow */}
          <div
            className="absolute inset-2 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 -z-10"
            style={{
              transform: "translateZ(-20px)",
              background: "radial-gradient(circle at center, var(--color-primary), transparent 70%)",
              filter: "blur(20px)",
            }}
          />

          {/* =========================================================
              Layer 2: 실제 카드 본체 (Link)
              - Card 컴포넌트 제거 -> 직접 스타일링
              - overflow-hidden과 rounded-2xl을 여기서 강제
             ========================================================= */}
          <Link
            href={`/post/${encodeURIComponent(slug)}`}
            className={cn(
              "block w-full h-full rounded-2xl border bg-card overflow-hidden",
              "ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "flex flex-col" // Flex Layout
            )}
            style={{
              transform: "translateZ(0)", // GPU Layer forcing (Safari fix)
              backfaceVisibility: "hidden"
            }}
          >
            {/* -------------------------------------------------------
                Section A: 이미지 영역 (높이 55%)
                - transform-gpu로 픽셀 깨짐 방지
                - 별도의 라운딩 처리 제거 (부모 Link의 overflow-hidden에 맡김)
               ------------------------------------------------------- */}
            <div
              className="relative w-full h-[55%] shrink-0 bg-muted overflow-hidden transform-gpu"
            >
              {headImage ? (
                <Image
                  src={headImage}
                  alt={title}
                  fill
                  sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                  className={cn(
                    "object-cover transition-transform duration-500",
                    isEventOn && "hover:scale-105"
                  )}
                  priority={false}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-8 w-8 opacity-50" />
                </div>
              )}

              {/* 배지 그룹 */}
              <div className="absolute left-3 top-3 flex gap-2 z-10">
                <Badge variant="secondary" className="shadow-sm/50 backdrop-blur-[2px] bg-secondary/90">
                  {categoryName}
                </Badge>
                {!published && (
                  <Badge variant="destructive" className="shadow-sm">
                    PRIVATE
                  </Badge>
                )}
              </div>

              {/* 텍스트 오버레이 (Gradient) */}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />

              <div className="absolute bottom-3 left-4 right-4 z-10">
                <h3 className="line-clamp-2 text-lg font-bold leading-tight tracking-tight text-foreground drop-shadow-sm">
                  {title}
                </h3>
                <p className="mt-1.5 text-xs font-medium text-muted-foreground/90">
                  {getTimeGapFromNow(writeDate, formatToYearMonthDay)}
                </p>
              </div>

              {/* 마우스 호버 시 빛 반사 효과 (Glare) - 이미지 위에만 적용 */}
              {isEventOn && (
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-0 hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "radial-gradient(circle at var(--px, 50%) var(--py, 50%), rgba(255,255,255,0.4) 0%, transparent 60%)",
                  }}
                />
              )}
            </div>

            {/* -------------------------------------------------------
                Section B: 컨텐츠 영역 (나머지 높이)
               ------------------------------------------------------- */}
            <div className="flex flex-1 flex-col p-4 pt-3 bg-card relative z-0">
              {/* 요약글 */}
              <p className="text-sm text-muted-foreground/90 line-clamp-3 leading-relaxed mb-auto">
                {headContent || "내용이 없습니다."}
              </p>

              {/* 태그 및 푸터 */}
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between">
                  {/* 태그 (최대 2개만 노출하여 공간 확보) */}
                  <div className="flex gap-1.5 overflow-hidden h-5">
                    {tags?.slice(0, 2).map((t) => (
                      <span key={t} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                        #{t}
                      </span>
                    ))}
                    {(tags?.length ?? 0) > 2 && (
                      <span className="text-[10px] text-muted-foreground px-1">+{tags!.length - 2}</span>
                    )}
                  </div>

                  {/* 통계 아이콘 */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium shrink-0 ml-2">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" /> {likeCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Border Overlay (테두리 뭉개짐 방지를 위한 별도 레이어) */}
            <div className="absolute inset-0 rounded-2xl border border-border pointer-events-none" />
          </Link>
        </div>
      </div>
    </AspectRatio>
  );
};

export default GridCard;