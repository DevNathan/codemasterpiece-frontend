import React from "react";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/shared/components/shadcn/breadcrumb";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shared/components/shadcn/tooltip";
import { useIsMobile } from "@/shared/hooks/use-mobile";

type Props = {
  title: string;
  categoryName: string;
  categoryLink: string;
};

export default function ResponsiveBreadcrumb({ title, categoryName, categoryLink }: Props) {
  const shortTitle = title.length > 18 ? title.slice(0, 18) + "…" : title;

  return (
    <div className="overflow-x-auto w-full pb-4">
      <Breadcrumb
        className="text-white/90 text-xs sm:text-sm md:text-base whitespace-nowrap"
        aria-label="게시글 위치 경로"
      >
        <BreadcrumbList className="flex items-center gap-1 sm:gap-2 md:gap-3">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/public">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/posts">Posts</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/posts/${categoryLink}`}>{categoryName}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          {/* 제목 부분 */}
          <BreadcrumbItem className="max-w-[180px] sm:max-w-[240px] md:max-w-none">
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <BreadcrumbPage className="truncate">{shortTitle}</BreadcrumbPage>
              </TooltipTrigger>
              {title.length > 18 && (
                <TooltipContent side="top" className="text-sm">
                  {title}
                </TooltipContent>
              )}
            </Tooltip>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
