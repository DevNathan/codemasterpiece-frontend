import React from "react";
import Image from "next/image";
import { Eye, Heart, ImageIcon } from "lucide-react";
import { Badge } from "@/shared/components/shadcn/badge";
import {
  formatToYearMonthDay,
  getTimeGapFromNow,
} from "@/lib/util/timeFormatter";
import Link from "next/link";
import { PostListDTO } from "@/features/post/type/PostListDTO";

type Props = { post: PostListDTO };

const ListCard = ({ post }: Props) => {
  const {
    slug,
    title,
    headImage,
    headContent,
    tags = [],
    createdAt,
    viewCount,
    likeCount,
    categoryName,
  } = post;

  const writeDate = new Date(createdAt);

  return (
    <Link
      href={`/post/${encodeURIComponent(slug)}`}
      className="
        group grid gap-3 p-3 transition-colors hover:bg-muted/30 rounded-lg
        sm:grid-cols-[12rem_1fr] sm:gap-5 sm:p-4
      "
    >
      {/* 썸네일: 모바일은 16:9 가변, sm부터 고정 박스 */}
      <div
        className="
          relative overflow-hidden rounded-md bg-muted
          aspect-[16/9] w-full
          sm:aspect-auto sm:h-28 sm:w-48
        "
      >
        {headImage ? (
          <Image
            src={headImage}
            alt={title}
            fill
            sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* 텍스트 영역 */}
      <div className="flex min-w-0 flex-col justify-between">
        <div className="flex flex-col gap-1">
          {/* 상단 메타 (카테고리/날짜) — 모바일에선 제목 위에 붙여 가독성 ↑ */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:hidden">
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
              {categoryName}
            </Badge>
            <span>{getTimeGapFromNow(writeDate, formatToYearMonthDay)}</span>
          </div>

          <h3
            className="
              text-[15px] font-semibold text-foreground line-clamp-2
              sm:text-base
              group-hover:text-primary transition
            "
          >
            {title}
          </h3>

          {/* 요약: 2줄 고정, 모바일에서도 안 넘치게 */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {headContent || "내용이 없습니다."}
          </p>

          {/* 태그: 모바일 2개만, sm부터 전부 */}
          {!!tags.length && (
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {tags.slice(0, 2).map((t) => (
                <Badge
                  key={t}
                  variant="outline"
                  className="rounded-full px-2 py-0 text-[11px]"
                >
                  #{t}
                </Badge>
              ))}

              {/* 모바일에선 나머지 개수 표기 */}
              {tags.length > 2 && (
                <Badge
                  variant="outline"
                  className="rounded-full px-2 py-0 text-[11px] sm:hidden"
                >
                  +{tags.length - 2}
                </Badge>
              )}

              {/* sm 이상에서만 3번째 이후 태그 노출 */}
              {tags.slice(2).map((t) => (
                <Badge
                  key={`more-${t}`}
                  variant="outline"
                  className="hidden rounded-full px-2 py-0 text-[11px] sm:inline-flex"
                >
                  #{t}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* 하단 메타: 모바일은 세로 스택, sm부터 좌우 정렬 */}
        <div
          className="
            mt-2 flex flex-col gap-2 text-xs text-muted-foreground
            sm:flex-row sm:items-center sm:justify-between
          "
        >
          <div className="hidden items-center gap-2 sm:flex">
            <Badge variant="secondary">{categoryName}</Badge>
            <span>{getTimeGapFromNow(writeDate, formatToYearMonthDay)}</span>
          </div>

          {/* 모바일용은 위에서 이미 출력함 */}
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
        </div>
      </div>
    </Link>
  );
};

export default ListCard;
