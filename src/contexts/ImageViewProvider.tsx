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
  const scaleRef = useRef(1); // 이벤트 리스너에서 최신 scale 값을 참조하기 위한 Ref

  // 리액트 리렌더링 지옥을 피하기 위해 X, Y 좌표는 상태가 아닌 Ref로 관리합니다.
  const translateRef = useRef({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false);

  const dragStartRef = useRef<{
    x: number;
    y: number;
    tx: number;
    ty: number;
  } | null>(null);

  const open = useCallback((s: string, a: string) => {
    setSrc(s);
    setAlt(a);
    setScale(1);
    scaleRef.current = 1;
    translateRef.current = { x: 0, y: 0 };
    setIsDragging(false);
    draggingRef.current = false;

    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }
  }, []);

  const close = useCallback(() => {
    setSrc(null);
    setAlt("");
    setScale(1);
    scaleRef.current = 1;
    translateRef.current = { x: 0, y: 0 };
    setIsDragging(false);
    draggingRef.current = false;

    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
  }, []);

  const zoomIn = useCallback(() => {
    setScale((prev) => {
      const next = Math.min(MAX_SCALE, prev + STEP);
      scaleRef.current = next;
      return next;
    });
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(MIN_SCALE, prev - STEP);
      scaleRef.current = next;
      return next;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    scaleRef.current = 1;
    translateRef.current = { x: 0, y: 0 };
    // 이미지가 패닝된 상태에서 scale이 이미 1이라면 리렌더링이 발생하지 않으므로 직접 DOM을 리셋합니다.
    if (imgRef.current) {
      imgRef.current.style.transform = `translate3d(0px, 0px, 0) scale(1)`;
    }
  }, []);

  // 키보드 핸들링 (+ / - / 0 / Esc)
  useEffect(() => {
    if (!src) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }

      if (e.key === "0") {
        e.preventDefault();
        resetZoom();
        return;
      }

      if (
        e.key === "+" ||
        (e.key === "=" && e.shiftKey) ||
        e.key === "ArrowUp"
      ) {
        e.preventDefault();
        zoomIn();
        return;
      }

      if (e.key === "-" || e.key === "_" || e.key === "ArrowDown") {
        e.preventDefault();
        zoomOut();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [src, close, zoomIn, zoomOut, resetZoom]);

  const handleWheel: React.WheelEventHandler<HTMLImageElement> = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else if (e.deltaY > 0) {
      zoomOut();
    }
  };

  const handleMouseDown: React.MouseEventHandler<HTMLImageElement> = (e) => {
    if (e.button !== 0) return;
    draggingRef.current = true;
    setIsDragging(true); // 커서 스타일 및 transition 변경을 위해 1회 렌더링을 유발합니다.
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      tx: translateRef.current.x,
      ty: translateRef.current.y,
    };
  };

  const handleTouchStart: React.TouchEventHandler<HTMLImageElement> = (e) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    draggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = {
      x: t.clientX,
      y: t.clientY,
      tx: translateRef.current.x,
      ty: translateRef.current.y,
    };
  };

  // 전역 move/up 리스너 (드래그 중 DOM 직접 조작)
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current || !dragStartRef.current) return;
      e.preventDefault();

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      translateRef.current.x = dragStartRef.current.tx + dx;
      translateRef.current.y = dragStartRef.current.ty + dy;

      // 리액트를 거치지 않고 DOM을 직접 수정하여 60fps를 방어합니다.
      if (imgRef.current) {
        imgRef.current.style.transform = `translate3d(${translateRef.current.x}px, ${translateRef.current.y}px, 0) scale(${scaleRef.current})`;
      }
    };

    const onMouseUp = () => {
      if (draggingRef.current) {
        draggingRef.current = false;
        setIsDragging(false); // 드래그 종료 시 1회 렌더링
        dragStartRef.current = null;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!draggingRef.current || !dragStartRef.current) return;
      if (e.touches.length !== 1) return;

      const t = e.touches[0];
      const dx = t.clientX - dragStartRef.current.x;
      const dy = t.clientY - dragStartRef.current.y;

      translateRef.current.x = dragStartRef.current.tx + dx;
      translateRef.current.y = dragStartRef.current.ty + dy;

      if (imgRef.current) {
        imgRef.current.style.transform = `translate3d(${translateRef.current.x}px, ${translateRef.current.y}px, 0) scale(${scaleRef.current})`;
      }
    };

    const onTouchEnd = () => {
      if (draggingRef.current) {
        draggingRef.current = false;
        setIsDragging(false);
        dragStartRef.current = null;
      }
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
      ? isDragging
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
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            className={cn(
              "max-w-full max-height-full select-none",
              cursorClass,
            )}
            style={{
              maxWidth: "95vw",
              maxHeight: "95vh",
              transform: `translate3d(${translateRef.current.x}px, ${translateRef.current.y}px, 0) scale(${scale})`,
              transition: isDragging ? "none" : "transform 120ms ease-out",
              transformOrigin: "center center",
            }}
            draggable={false}
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />

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
