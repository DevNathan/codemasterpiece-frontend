"use client";

import React, { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PaginationMeta } from "@/shared/type/PaginationMeta";
import getPageNumbers from "@/shared/components/pagination/getPageNumbers";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/shadcn/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/components/shadcn/dropdown-menu";
import { Button } from "@/shared/components/shadcn/button";
import { ChevronDown } from "lucide-react";

type Props = {
  pagination: PaginationMeta;
  action: (pNum: number) => void;
  shouldBePushed?: boolean;
  prefetch?: (pNum: number) => void;
};

const PageSelector = React.memo(function PageSelector({
  pagination,
  action,
  shouldBePushed = true,
  prefetch,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pages = useMemo(() => getPageNumbers(pagination), [pagination]);

  const buildUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("p", page.toString());
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams],
  );

  const safeSet = useCallback(
    (page: number) => {
      action(page);
      if (shouldBePushed) {
        router.push(buildUrl(page), { scroll: false });
      }
    },
    [action, buildUrl, router, shouldBePushed],
  );

  const clampPrev = Math.max(1, pagination.currentPage - 1);
  const clampNext = Math.min(pagination.pageEnd, pagination.currentPage + 1);

  const [open, setOpen] = useState(false);

  const select = (page: number) => {
    const next = Math.min(Math.max(1, page), pagination.pageEnd);
    prefetch?.(next);
    safeSet(next);
    setOpen(false);
  };

  return (
    <div className="my-4 flex flex-col items-center gap-2">
      <Pagination>
        <PaginationContent>
          <PaginationItem className="hidden sm:block">
            <PaginationPrevious
              aria-disabled={pagination.currentPage === 1}
              tabIndex={pagination.currentPage === 1 ? -1 : 0}
              href={buildUrl(clampPrev)}
              onMouseEnter={() => prefetch?.(clampPrev)}
              onClick={(e) => {
                e.preventDefault();
                if (pagination.currentPage === 1) return;
                select(clampPrev);
              }}
            />
          </PaginationItem>

          {pages.map((page, index) =>
            page === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={`p-${page}`}>
                <PaginationLink
                  href={buildUrl(Number(page))}
                  aria-current={
                    Number(page) === pagination.currentPage ? "page" : undefined
                  }
                  isActive={Number(page) === pagination.currentPage}
                  onMouseEnter={() => prefetch?.(Number(page))}
                  onClick={(e) => {
                    e.preventDefault();
                    select(Number(page));
                  }}
                  className={
                    Number(page) === pagination.currentPage
                      ? "text-point font-semibold"
                      : undefined
                  }
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem className="hidden sm:block">
            <PaginationNext
              aria-disabled={pagination.currentPage === pagination.pageEnd}
              tabIndex={pagination.currentPage === pagination.pageEnd ? -1 : 0}
              href={buildUrl(clampNext)}
              onMouseEnter={() => prefetch?.(clampNext)}
              onClick={(e) => {
                e.preventDefault();
                if (pagination.currentPage === pagination.pageEnd) return;
                select(clampNext);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Page</span>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex h-8 min-w-[84px] items-center justify-between gap-1 px-2 text-sm"
              aria-label={`현재 페이지 ${pagination.currentPage}, 전체 ${pagination.pageEnd}쪽`}
            >
              {pagination.currentPage} / {pagination.pageEnd}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-[260px] rounded-md border bg-popover p-0 text-sm shadow-md"
          >
            {/* 상단 빠른 점프 영역 */}
            <div className="p-2">
              <div className="flex items-center gap-2">
                <label htmlFor="jump-input" className="sr-only">
                  Go to page
                </label>
                <input
                  id="jump-input"
                  type="number"
                  min={1}
                  max={pagination.pageEnd}
                  defaultValue={pagination.currentPage}
                  className="h-8 w-[90px] rounded-md border bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = Number((e.target as HTMLInputElement).value);
                      if (!Number.isNaN(val)) select(val);
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    const input = document.getElementById(
                      "jump-input",
                    ) as HTMLInputElement | null;
                    const val = Number(input?.value ?? pagination.currentPage);
                    select(val);
                  }}
                >
                  Go
                </Button>
              </div>

              {/* 퀵 액션 */}
              <div className="mt-2 grid grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={pagination.currentPage === 1}
                  onMouseEnter={() => prefetch?.(1)}
                  onClick={() => select(1)}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={pagination.currentPage === 1}
                  onMouseEnter={() =>
                    prefetch?.(Math.max(1, pagination.currentPage - 1))
                  }
                  onClick={() =>
                    select(Math.max(1, pagination.currentPage - 1))
                  }
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={pagination.currentPage === pagination.pageEnd}
                  onMouseEnter={() =>
                    prefetch?.(
                      Math.min(pagination.pageEnd, pagination.currentPage + 1),
                    )
                  }
                  onClick={() =>
                    select(
                      Math.min(pagination.pageEnd, pagination.currentPage + 1),
                    )
                  }
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={pagination.currentPage === pagination.pageEnd}
                  onMouseEnter={() => prefetch?.(pagination.pageEnd)}
                  onClick={() => select(pagination.pageEnd)}
                >
                  Last
                </Button>
              </div>
            </div>

            {/* 구분선 */}
            <div className="h-px w-full bg-border" />

            {/* 페이지 그리드(스크롤 가능) */}
            <div className="max-h-64 overflow-y-auto p-2">
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: pagination.pageEnd }, (_, i) => {
                  const page = i + 1;
                  const active = page === pagination.currentPage;
                  return (
                    <button
                      key={page}
                      type="button"
                      onMouseEnter={() => prefetch?.(page)}
                      onClick={() => select(page)}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "h-8 rounded-md text-sm",
                        active
                          ? "bg-primary text-primary-foreground font-medium"
                          : "border bg-background hover:bg-muted",
                      ].join(" ")}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});

export default PageSelector;
