"use client";

import { ReactNode, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { formatISO, subDays } from "date-fns";
import {
  CalendarIcon,
  Download,
  Loader2,
  Sparkles,
  Triangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/shared/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/shadcn/card";
import { Calendar } from "@/shared/components/shadcn/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/shadcn/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/shadcn/dropdown-menu";

import type { DateRange } from "react-day-picker";
import { useVisitorsQuery } from "@/features/analytics/hooks/useVisitorQuery";
import { saveAsCsv } from "@/features/analytics/utils/copyAsCsv";

const VisitorChart = dynamic(
  () => import("@/features/analytics/ui/chart/VisitorChart"),
  { ssr: false },
);

type Period = "day" | "week" | "month";
const DEFAULT_RANGE_BY_PERIOD: Record<Period, number> = {
  day: 7,
  week: 28,
  month: 180,
};

export function VisitorsBlock() {
  const [period, setPeriod] = useState<Period>("day");
  const [theme, setTheme] = useState<"pastel" | "bold" | "neon">("pastel");

  const today = new Date();
  const initialFrom = subDays(today, DEFAULT_RANGE_BY_PERIOD[period] - 1);
  const [range, setRange] = useState<DateRange>({
    from: initialFrom,
    to: today,
  });

  const { fromISO, toISO } = useMemo(() => {
    const from = range.from ?? initialFrom;
    const to = range.to ?? today;
    return {
      fromISO: formatISO(from, { representation: "date" }),
      toISO: formatISO(to, { representation: "date" }),
    };
  }, [range, period]);

  const { data, isLoading, isFetching, isError, refetch, totals, prevDelta } =
    useVisitorsQuery({
      period,
      from: fromISO,
      to: toISO,
    });

  return (
    <section
      className={cn(
        "relative w-full min-h-[100dvh] py-20",
        "grid place-items-center",
        "border-t border-border/60 bg-gradient-to-br from-background/40 to-muted/40",
      )}
    >
      {/* 배경 오로라 + 라이트 그리드 */}
      <BackdropAura />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative z-10 w-full p-6 overflow-hidden">
        <div
          className={cn(
            "mx-auto max-w-6xl space-y-6",
            theme === "pastel" && "chart-theme-pastel",
            theme === "bold" && "chart-theme-bold",
            theme === "neon" && "chart-theme-neon",
          )}
        >
          {/* ====== Section Header ====== */}
          <div className="flex flex-col gap-3">
            <h2
              className={cn(
                "text-2xl sm:text-4xl font-black tracking-tight",
                "bg-gradient-to-r from-[hsl(var(--point))] via-foreground to-foreground/70 bg-clip-text text-transparent",
              )}
            >
              트래픽 인사이트
            </h2>

            {/* 정보 배지 라인 */}
            <div className="flex flex-wrap gap-2">
              <BadgeSoft>
                범위: {fromISO} ~ {toISO}
              </BadgeSoft>
              <BadgeSoft>
                보기:{" "}
                {period === "day"
                  ? "일간"
                  : period === "week"
                    ? "주간"
                    : "월간"}
              </BadgeSoft>
              <BadgeSoft>테마: {theme}</BadgeSoft>
            </div>
          </div>

          {/* ====== Toolbar ====== */}
          <GlassBar className="grid gap-2 p-2 grid-cols-1 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center">
            {/* 1) 보기 Segmented */}
            <div className="min-w-0">
              <Segmented
                value={period}
                onChange={(v: Period) => {
                  setPeriod(v);
                  const days = DEFAULT_RANGE_BY_PERIOD[v] - 1;
                  setRange({ from: subDays(today, days), to: today });
                }}
                options={[
                  { label: "일간", value: "day" },
                  { label: "주간", value: "week" },
                  { label: "월간", value: "month" },
                ]}
              />
            </div>

            {/* 2) 날짜 선택 */}
            <div className="flex flex-wrap items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-none w-auto h-8 px-2 gap-2 text-xs"
                  >
                    <CalendarIcon className="h-3 w-3 shrink-0" />
                    <span className="whitespace-nowrap">
                      {fromISO} ~ {toISO}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  side="bottom"
                  sideOffset={4}
                  className="w-[--radix-popover-trigger-width] p-2"
                >
                  <Calendar
                    mode="range"
                    numberOfMonths={1}
                    selected={range}
                    onSelect={(r) =>
                      setRange(r ?? { from: initialFrom, to: today })
                    }
                    defaultMonth={range.from ?? initialFrom}
                    disabled={{ after: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 3) 테마: 우측 정렬 고정 */}
            <div className="flex sm:justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs w-full sm:w-auto"
                  >
                    테마
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[140px]">
                  <DropdownMenuItem onClick={() => setTheme("pastel")}>
                    pastel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("bold")}>
                    bold
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("neon")}>
                    neon
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* 4) CSV: 테마 옆에 딱 붙여 */}
            <div className="flex sm:justify-end">
              <Button
                size="sm"
                onClick={() => data && saveAsCsv({ series: data, totals })}
                disabled={!data?.length}
                className="h-8 px-2 text-xs gap-2 w-full sm:w-auto"
              >
                <Download className="h-3 w-3" />
                CSV
              </Button>
            </div>

            {/* 5) 새로고침: 모바일에선 다음 줄 풀폭, 데스크톱에선 날짜 아래 좌측에만 보이게 */}
            <div className="col-span-1 sm:col-span-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="w-full sm:w-auto h-8 px-2 text-xs justify-center sm:justify-start"
              >
                {isFetching ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                <span className="ml-2">새로고침</span>
              </Button>
            </div>
          </GlassBar>

          {/* ====== KPI Cards ====== */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KpiCard
              title="PV"
              value={totals.pv}
              delta={prevDelta?.pv}
              loading={isLoading}
            />
            <KpiCard
              title="UV"
              value={totals.uv}
              delta={prevDelta?.uv}
              loading={isLoading}
            />
            <KpiCard
              title="Session"
              value={totals.session}
              delta={prevDelta?.session}
              loading={isLoading}
            />
          </div>

          {/* ====== Chart Card ====== */}
          <Card className="shadow-xl backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                사이트 방문자 수
                {isFetching && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isError ? (
                <ErrorBanner>데이터를 불러오지 못했습니다.</ErrorBanner>
              ) : (
                // 고정 높이 금지. 너비 기반 반응형 비율 + 극단 가드.
                <div className="w-full aspect-[4/3] md:aspect-[16/9] min-h-[220px] max-h-[480px]">
                  <VisitorChart period={period} series={data ?? []} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ============================= */
/* ======= Sub Components ====== */

function BackdropAura() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-70">
      <div className="absolute -top-28 left-1/3 w-[40vw] h-[40vw] rounded-full blur-3xl bg-[radial-gradient(circle_at_center,hsl(var(--point))/12_0%,transparent_60%)]" />
      <div className="absolute bottom-0 right-1/4 w-[45vw] h-[45vw] rounded-full blur-3xl bg-[radial-gradient(circle_at_center,#7c3aed33_0%,transparent_60%)]" />
    </div>
  );
}

function GlassBar({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-2 border border-border/60",
        "bg-card/60 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md",
        "shadow-[0_8px_30px_-12px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function BadgeSoft({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground">
      {children}
    </span>
  );
}

/** 미니 세그먼트 컨트롤 (강화 스타일) */
function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { label: string; value: T }[];
}) {
  return (
    <div className="inline-flex rounded-xl border bg-background p-1 shadow-sm">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative px-3 py-1.5 text-sm rounded-lg transition",
              active
                ? "bg-primary text-primary-foreground shadow ring-1 ring-primary/70"
                : "hover:bg-muted",
            )}
            aria-pressed={active}
          >
            {o.label}
            {active && (
              <span className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-primary/20" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function KpiCard({
  title,
  value,
  delta,
  loading,
}: {
  title: string;
  value: number;
  delta?: number;
  loading: boolean;
}) {
  const sign =
    delta === undefined ? "" : delta > 0 ? "+" : delta < 0 ? "−" : "±";
  const color =
    delta === undefined
      ? "text-muted-foreground"
      : delta > 0
        ? "text-emerald-500"
        : delta < 0
          ? "text-red-500"
          : "text-muted-foreground";

  return (
    <div
      className={cn(
        "relative rounded-2xl p-[1px]",
        "bg-gradient-to-br from-[hsl(var(--point))/60] via-border to-transparent",
      )}
    >
      <Card className="rounded-2xl border-border/60 bg-card/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
        <CardContent className="py-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {title}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <div className="text-2xl font-semibold tabular-nums">
              {loading ? "…" : value.toLocaleString()}
            </div>
            <div className={cn("text-xs tabular-nums", color)}>
              {delta === undefined
                ? ""
                : `${sign}${Math.abs(delta).toLocaleString()} vs prev`}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* soft corner glow */}
      <div className="pointer-events-none absolute -inset-0.5 rounded-2xl opacity-50 blur-2xl bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--point))/15_0%,transparent_60%)]" />
    </div>
  );
}

function ErrorBanner({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border px-3 py-2",
        "border-destructive/30 bg-destructive/10 text-destructive",
      )}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <Triangle className="h-4 w-4" />
        <span className="text-sm">{children}</span>
      </div>
      <Button variant="destructive" size="sm" onClick={() => location.reload()}>
        다시 시도
      </Button>
    </div>
  );
}
