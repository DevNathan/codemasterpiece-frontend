"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { cn } from "@/lib/utils";

type ImageViewerCtx = {
  src: string | null;
  alt: string;
  open: (src: string, alt: string) => void;
  close: () => void;
};

const Ctx = createContext<ImageViewerCtx | null>(null);

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;
const STEP = 0.25;

export const ImageViewerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [src, setSrc] = useState<string | null>(null);
  const [alt, setAlt] = useState("");
  const [scale, setScale] = useState(1);

  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const draggingRef = useRef(false);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    tx: number;
    ty: number;
  } | null>(null);

  const open = (s: string, a: string) => {
    setSrc(s);
    setAlt(a);
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);

    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }
  };

  const close = useCallback(() => {
    setSrc(null);
    setAlt("");
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);

    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
  }, []);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(MAX_SCALE, prev + STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(MIN_SCALE, prev - STEP));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  }, []);

  // 키보드 핸들링 (+ / - / 0 / Esc)
  useEffect(() => {
    if (!src) return;

    const onKeyDown = (e: KeyboardEvent) => {
      // 입력중이면 무시
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }

      // 닫기
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }

      // 리셋
      if (e.key === "0") {
        e.preventDefault();
        resetZoom();
        return;
      }

      // 줌 인: +, = (Shift+), ArrowUp
      if (
        e.key === "+" ||
        (e.key === "=" && e.shiftKey) ||
        e.key === "ArrowUp"
      ) {
        e.preventDefault();
        zoomIn();
        return;
      }

      // 줌 아웃: -, _, ArrowDown
      if (e.key === "-" || e.key === "_" || e.key === "ArrowDown") {
        e.preventDefault();
        zoomOut();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [src, close, zoomIn, zoomOut, resetZoom]);

  // 휠 줌
  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else if (e.deltaY > 0) {
      zoomOut();
    }
  };

  // 마우스 드래그 시작
  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    // 왼쪽 버튼만
    if (e.button !== 0) return;
    // 확대 안 돼있으면 패닝 의미 적으니 원하면 막아도 됨 (지금은 허용)
    draggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      tx: translateX,
      ty: translateY,
    };
  };

  // 터치 드래그 시작
  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    draggingRef.current = true;
    dragStartRef.current = {
      x: t.clientX,
      y: t.clientY,
      tx: translateX,
      ty: translateY,
    };
  };

  // 전역 move/up 리스너 (드래그 중)
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current || !dragStartRef.current) return;
      e.preventDefault();

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      setTranslateX(dragStartRef.current.tx + dx);
      setTranslateY(dragStartRef.current.ty + dy);
    };

    const onMouseUp = () => {
      draggingRef.current = false;
      dragStartRef.current = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!draggingRef.current || !dragStartRef.current) return;
      if (e.touches.length !== 1) return;

      const t = e.touches[0];
      const dx = t.clientX - dragStartRef.current.x;
      const dy = t.clientY - dragStartRef.current.y;

      setTranslateX(dragStartRef.current.tx + dx);
      setTranslateY(dragStartRef.current.ty + dy);
    };

    const onTouchEnd = () => {
      draggingRef.current = false;
      dragStartRef.current = null;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  const cursorClass =
    scale > 1
      ? draggingRef.current
        ? "cursor-grabbing"
        : "cursor-grab"
      : "cursor-default";

  return (
    <Ctx.Provider value={{ src, alt, open, close }}>
      {children}

      {src && (
        <div
          className={cn(
            "fixed inset-0 z-[9999] flex items-center justify-center",
            "bg-black/85 backdrop-blur-sm cursor-zoom-out",
          )}
          onClick={close}
        >
          {/* 줌 + 패닝 영역 */}
          <div
            className={cn(
              "relative max-w-[95vw] max-h-[95vh] flex items-center justify-center",
              cursorClass,
            )}
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <img
              src={src}
              alt={alt}
              className="max-w-full max-height-full select-none"
              style={{
                maxWidth: "95vw",
                maxHeight: "95vh",
                transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                transition: draggingRef.current
                  ? "none"
                  : "transform 120ms ease-out",
                transformOrigin: "center center",
              }}
              draggable={false}
            />
          </div>

          {/* 하단 컨트롤 바 */}
          <div
            className="fixed bottom-5 inset-x-0 flex justify-center pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="pointer-events-auto flex items-center gap-2 rounded-full
                         bg-black/70 text-xs text-white px-3 py-1 shadow-lg"
            >
              <button
                type="button"
                onClick={zoomOut}
                className="px-2 py-0.5 rounded-full hover:bg-white/10"
              >
                -
              </button>
              <span className="tabular-nums text-[11px] min-w-[4rem] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                className="px-2 py-0.5 rounded-full hover:bg-white/10"
              >
                +
              </button>
              <button
                type="button"
                onClick={resetZoom}
                className="ml-1 px-2 py-0.5 rounded-full hover:bg-white/10 text-[10px]"
              >
                Reset
              </button>
              <span className="ml-2 text-[10px] text-white/70">
                Drag / Wheel / +/- / 0 / Esc
              </span>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
};

export const useImageViewer = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useImageViewer must be in provider");
  return ctx;
};
