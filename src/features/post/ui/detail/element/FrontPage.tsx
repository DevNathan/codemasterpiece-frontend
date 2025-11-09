"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import {
  ArrowDown,
  BadgeCheck,
  Eye,
  FileText,
  Heart,
  MessageCircleMore,
  Tag as TagIcon,
} from "lucide-react";
import {
  formatToYearMonthDay,
  getTimeGapFromNow,
} from "@/lib/util/timeFormatter";
import ResponsiveBreadcrumb from "@/features/post/ui/detail/element/ResponsiveBreadcrumb";
import TypingTitle from "@/features/post/ui/detail/element/TypingTitle";

type Props = {
  title: string;
  headImage: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  headContent: string;
  createdAt: string;
  isPublished: boolean;
  categoryName: string;
  categoryLink: string;
  tags: string[];
  updatedAt: string | null;
};

const FrontPage = ({
  headImage,
  title,
  headContent,
  viewCount,
  likeCount,
  commentCount,
  createdAt,
  isPublished,
  categoryName,
  categoryLink,
  tags = [],
  updatedAt,
}: Props) => {
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const headers = document.getElementsByClassName("root-header");
    if (!headers.length || !targetRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        for (const el of headers) {
          if (!(el instanceof HTMLElement)) continue;
          if (entry.isIntersecting) {
            el.classList.add("bg-transparent", "backdrop-blur-md");
            el.classList.remove("bg-sidebar");
          } else {
            el.classList.add("bg-sidebar");
            el.classList.remove("bg-transparent", "backdrop-blur-md");
          }
        }
      },
      {
        root: null,
        threshold: 0.2,
      },
    );

    observer.observe(targetRef.current);

    return () => {
      observer.disconnect();
      for (const el of headers) {
        if (!(el instanceof HTMLElement)) continue;
        el.classList.remove("bg-transparent", "backdrop-blur-md");
        el.classList.add("bg-sidebar");
      }
    };
  }, []);

  const created = getTimeGapFromNow(new Date(createdAt), formatToYearMonthDay);
  const updated =
    updatedAt && updatedAt !== createdAt
      ? getTimeGapFromNow(new Date(updatedAt), formatToYearMonthDay)
      : null;

  const scrollToContent = () => {
    const content = document.getElementById("post-content");
    if (content) content.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="relative w-full min-h-screen h-[100svh] overflow-clip">
      {/* 정적인 히어로 이미지(애니메이션/패럴랙스 없음) */}
      <div ref={targetRef} className="absolute inset-0">
        <Image
          className="object-cover"
          src={headImage}
          alt={title}
          priority
          fill
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/60" />
      </div>

      {/* 좌상단 카테고리 배지 (정적) */}
      {!!categoryName && (
        <div className="absolute top-19 left-10 z-10">
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium bg-black/40 text-white/90 border border-white/10 shadow-sm">
            <BadgeCheck className="w-3.5 h-3.5" />
            {categoryName}
          </span>
        </div>
      )}

      {/* 타이틀/메타 (정적) */}
      <div className="relative z-10 h-full flex flex-col justify-end">
        <div className="px-4 md:px-6 lg:px-8 pb-10">
          <div className="mx-auto w-full max-w-[1040px]">
            {/* blur/큰 그림자/애니메이션 제거한 가벼운 카드 */}
            <div className="rounded-2xl border border-white/10 bg-black/35 shadow-md p-5 md:p-7">
              {/* Breadcrumb */}
              <ResponsiveBreadcrumb
                title={title}
                categoryName={categoryName}
                categoryLink={categoryLink}
              />

              {/* 제목 */}
              <TypingTitle title={title} />

              {/* 메타: 날짜/통계 */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-white/85">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4" />
                  <time>{created}</time>
                  {updated && (
                    <>
                      <span className="mx-1 opacity-50">•</span>
                      <span className="flex items-center gap-1">
                        <span className="">Updated</span>
                        <time>{updated}</time>
                      </span>
                    </>
                  )}
                  {!isPublished && (
                    <>
                      <span className="mx-1 opacity-50">•</span>
                      <span className="text-amber-300/90">Draft</span>
                    </>
                  )}
                </div>

                <div className="ml-auto flex items-center gap-5 text-sm">
                  <Stat icon={<Eye className="w-4 h-4" />} value={viewCount} />
                  <Stat
                    icon={<Heart className="w-4 h-4" />}
                    value={likeCount}
                  />
                  <Stat
                    icon={<MessageCircleMore className="w-4 h-4" />}
                    value={commentCount}
                  />
                </div>
              </div>

              {/* 요약 */}
              {headContent && (
                <p className="mt-4 text-sm md:text-base leading-relaxed text-white/90 whitespace-pre-wrap">
                  {headContent}
                </p>
              )}

              {/* 태그 */}
              {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 text-white/70 text-xs">
                    <TagIcon className="w-3.5 h-3.5" />
                    <span className="uppercase tracking-wide">Tags</span>
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <li
                        key={t}
                        className="px-2.5 py-1 rounded-full text-xs text-white/90 bg-white/10 border border-white/10"
                      >
                        #{t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 스크롤 큐(모션 제거: hover translate/transition 제거) */}
              <div className="mt-5 flex items-center justify-center">
                <button
                  onClick={scrollToContent}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-white/90"
                  aria-label="본문으로 이동"
                >
                  <ArrowDown className="w-4 h-4" />
                  Read
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 연결 그라데이션 (정적) */}
      <div className="absolute bottom-0 left-0 right-0 h-[30svh] bg-gradient-to-b from-transparent to-background" />
    </header>
  );
};

function Stat({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      {icon}
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

export default FrontPage;
