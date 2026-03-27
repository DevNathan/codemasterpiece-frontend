/* eslint-disable @next/next/no-img-element */
"use client";

/**
 * @file ImageViewProvider.tsx
 * @description 전역으로 사용할 수 있는 이미지 뷰어(Lightbox) 컨텍스트 및 프로바이더입니다.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { cn } from "@/lib/utils";

/**
 * @interface ImageViewerCtx
 * @description 이미지 뷰어 컨텍스트가 제공하는 상태 및 제어 함수 규격입니다.
 */
type ImageViewerCtx = {
  src: string | null;
  alt: string;
  open: (src: string, alt: string) => void;
  close: () => void;
};

const Ctx = createContext<ImageViewerCtx | null>(null);

// 확대/축소 비율 상수 정의
const MIN_SCALE = 0.5;
const MAX_SCALE = 4;
const STEP = 0.25;

export const ImageViewerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // --- 상태(State) 관리 ---
  // 이미지 소스, 대체 텍스트, 확대 비율 등 UI 갱신이 필수적인 요소만 React State로 관리합니다.
  const [src, setSrc] = useState<string | null>(null);
  const [alt, setAlt] = useState("");
  const [scale, setScale] = useState(1);

  // 이벤트 리스너 내부에서 최신 scale 값을 참조하기 위한 Ref입니다.
  const scaleRef = useRef(1);

  // --- 비상태(Ref) 관리 (성능 최적화 핵심) ---
  // 위치 이동(Translate) 좌표입니다. React State로 관리할 경우 마우스 이동 시마다
  // 리렌더링이 발생하여 랙(인풋 랙)이 발생하므로, Ref에 값을 저장합니다.
  const translateRef = useRef({ x: 0, y: 0 });

  // 직접 CSS transform을 주입할 대상 이미지 엘리먼트 참조입니다.
  const imgRef = useRef<HTMLImageElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false);

  // 드래그 시작 시점의 마우스 포인터 좌표 및 이미지의 원래 위치를 저장합니다.
  const dragStartRef = useRef<{
    x: number;
    y: number;
    tx: number;
    ty: number;
  } | null>(null);

  /**
   * @function applyTransform
   * @description React 렌더링 사이클을 거치지 않고, 브라우저 DOM에 직접 transform 속성을 적용합니다.
   * @param {boolean} animate - true일 경우 부드러운 전환(transition) 효과를 추가합니다.
   */
  const applyTransform = useCallback((animate: boolean) => {
    if (!imgRef.current) return;
    imgRef.current.style.transition = animate
      ? "transform 120ms ease-out"
      : "none";
    imgRef.current.style.transform = `translate3d(${translateRef.current.x}px, ${translateRef.current.y}px, 0) scale(${scaleRef.current})`;
  }, []);

  /**
   * @function resetTransform
   * @description 뷰어의 이동 좌표 및 확대 비율을 초기화합니다.
   */
  const resetTransform = useCallback(() => {
    setScale(1);
    scaleRef.current = 1;
    translateRef.current = { x: 0, y: 0 };
    setIsDragging(false);
    draggingRef.current = false;
    applyTransform(false);
  }, [applyTransform]);

  /**
   * @function open
   * @description 이미지 뷰어를 활성화하고 배경 스크롤을 차단합니다.
   */
  const open = useCallback(
    (s: string, a: string) => {
      setSrc(s);
      setAlt(a);
      resetTransform();

      if (typeof document !== "undefined") {
        document.body.style.overflow = "hidden";
      }
    },
    [resetTransform],
  );

  /**
   * @function close
   * @description 이미지 뷰어를 비활성화하고 배경 스크롤 차단을 해제합니다.
   */
  const close = useCallback(() => {
    setSrc(null);
    setAlt("");
    resetTransform();

    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
  }, [resetTransform]);

  /**
   * @function zoomIn / zoomOut / resetZoom
   * @description 이미지 확대/축소를 제어합니다. 상태 갱신 후 DOM에 즉각 반영(applyTransform)합니다.
   */
  const zoomIn = useCallback(() => {
    setScale((prev) => {
      const next = Math.min(MAX_SCALE, prev + STEP);
      scaleRef.current = next;
      applyTransform(true);
      return next;
    });
  }, [applyTransform]);

  const zoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(MIN_SCALE, prev - STEP);
      scaleRef.current = next;
      applyTransform(true);
      return next;
    });
  }, [applyTransform]);

  const resetZoom = useCallback(() => {
    resetTransform();
    applyTransform(true);
  }, [resetTransform, applyTransform]);

  // 키보드 단축키 이벤트 리스너 바인딩
  useEffect(() => {
    if (!src) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      // 입력창(Input, Textarea) 내부에서의 키 입력은 무시합니다.
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

  /**
   * @function handleWheel
   * @description 마우스 휠 이벤트로 줌 인/아웃을 처리합니다.
   */
  const handleWheel: React.WheelEventHandler<HTMLImageElement> = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else if (e.deltaY > 0) {
      zoomOut();
    }
  };

  /**
   * @function startDrag
   * @description 마우스 및 터치 이벤트 발생 시 드래그 시작 좌표를 기록합니다.
   */
  const startDrag = (clientX: number, clientY: number) => {
    draggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      tx: translateRef.current.x,
      ty: translateRef.current.y,
    };
  };

  const handleMouseDown: React.MouseEventHandler<HTMLImageElement> = (e) => {
    if (e.button !== 0) return;
    startDrag(e.clientX, e.clientY);
  };

  const handleTouchStart: React.TouchEventHandler<HTMLImageElement> = (e) => {
    if (e.touches.length !== 1) return;
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
  };

  // 마우스 및 터치 이동(드래그) 이벤트 바인딩
  useEffect(() => {
    const doMove = (clientX: number, clientY: number) => {
      if (!draggingRef.current || !dragStartRef.current) return;

      // 마우스 포인터의 이동량(Delta)을 계산합니다.
      const dx = clientX - dragStartRef.current.x;
      const dy = clientY - dragStartRef.current.y;

      // 이동량을 초기 위치에 더해 최종 좌표를 도출합니다.
      translateRef.current.x = dragStartRef.current.tx + dx;
      translateRef.current.y = dragStartRef.current.ty + dy;

      // 브라우저의 기본 렌더링 속도에 맞춰 즉각적으로 DOM을 업데이트합니다.
      applyTransform(false);
    };

    const endDrag = () => {
      if (draggingRef.current) {
        draggingRef.current = false;
        setIsDragging(false);
        dragStartRef.current = null;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      doMove(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!draggingRef.current || e.touches.length !== 1) return;
      doMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    // 이미지 엘리먼트 밖으로 마우스가 나가더라도 드래그가 유지되도록 window 객체에 이벤트를 바인딩합니다.
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", endDrag);
    window.addEventListener("touchcancel", endDrag);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", endDrag);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", endDrag);
      window.removeEventListener("touchcancel", endDrag);
    };
  }, [applyTransform]);

  // 확대 여부 및 드래그 상태에 따른 마우스 커서 스타일 정의
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
            "fixed inset-0 z-9999 flex items-center justify-center",
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
              // React의 통제를 완전히 배제하기 위해 transform 정보는 인라인 스타일에서 생략합니다.
              transformOrigin: "center center",
              willChange: "transform", // GPU 하드웨어 가속을 강제합니다.
            }}
            draggable={false}
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onLoad={() => applyTransform(false)}
          />

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
              <span className="tabular-nums text-[11px] min-w-16 text-center">
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
