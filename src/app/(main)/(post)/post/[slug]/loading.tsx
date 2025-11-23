import { Skeleton } from "@/shared/components/shadcn/skeleton";

export default function Loading() {
  return (
    <div className="w-full min-h-screen">
      <header className="relative w-full h-[100svh] overflow-hidden">
        {/* 배경 이미지 자리 (어두운 느낌 유지) */}
        <div className="absolute inset-0 bg-background/80">
          <Skeleton className="h-full w-full bg-muted/10" />
        </div>

        {/* 좌상단 카테고리 배지 위치 */}
        <div className="absolute top-19 left-10 z-10 hidden md:block">
          <Skeleton className="h-7 w-24 rounded-full bg-muted/20" />
        </div>

        {/* 하단 정보 카드 영역 */}
        <div className="relative z-10 h-full flex flex-col justify-end pb-10 px-4 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1040px]">
            {/* 카드 박스 형태 */}
            <div className="rounded-2xl border border-white/5 bg-black/20 p-5 md:p-7 backdrop-blur-sm">
              {/* Breadcrumb */}
              <Skeleton className="h-4 w-32 mb-4 bg-white/10" />

              {/* Title (2줄 정도 예상) */}
              <div className="space-y-3 mb-4">
                <Skeleton className="h-10 md:h-14 w-3/4 bg-white/10" />
                <Skeleton className="h-10 md:h-14 w-1/2 bg-white/10" />
              </div>

              {/* Meta Info (날짜, 조회수 등) */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <Skeleton className="h-5 w-40 bg-white/10" />
                <div className="flex gap-4">
                  <Skeleton className="h-5 w-12 bg-white/10" />
                  <Skeleton className="h-5 w-12 bg-white/10" />
                  <Skeleton className="h-5 w-12 bg-white/10" />
                </div>
              </div>

              {/* Summary (HeadContent) */}
              <div className="space-y-2 mb-6">
                <Skeleton className="h-4 w-full bg-white/10" />
                <Skeleton className="h-4 w-[90%] bg-white/10" />
              </div>

              {/* Tags */}
              <div className="flex gap-2 mb-6">
                <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
                <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
                <Skeleton className="h-6 w-14 rounded-full bg-white/10" />
              </div>

              {/* Read Button */}
              <div className="flex justify-center">
                <Skeleton className="h-9 w-24 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] w-full mx-auto px-5 py-20">
        <div className="space-y-8 max-w-3xl mx-auto">
          {/* 문단 1 */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[98%]" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[90%]" />
          </div>

          {/* 중간 이미지 같은 큰 덩어리 */}
          <Skeleton className="h-64 w-full rounded-xl" />

          {/* 문단 2 */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-[96%]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[92%]" />
          </div>

          {/* Author Box 흉내 */}
          <div className="flex items-center gap-4 border-t pt-8 mt-12">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
