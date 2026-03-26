/**
 * 이미지 로드 실패 시 실행할 실제 로직
 */
const handleImgError = (e: Event) => {
  const target = e.target as HTMLElement;

  // 에러가 발생한 요소가 IMG이고, 아직 폴백이 적용되지 않았는지 확인
  if (target instanceof HTMLImageElement && !target.dataset.fallbackApplied) {
    target.dataset.fallbackApplied = "true";

    const fallbackDiv = document.createElement("div");
    fallbackDiv.className =
      "flex flex-col items-center justify-center p-4 border rounded bg-muted/40 text-muted-foreground my-4 mx-auto w-full max-w-[500px] h-[300px] text-sm gap-1 relative overflow-hidden group";

    fallbackDiv.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-2 size-6 opacity-70 transition-opacity duration-200 group-hover:opacity-90">
          <line x1="2" x2="22" y1="2" y2="22"/><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/><line x1="13.5" x2="6" y1="13.5" y2="21"/><line x1="18" x2="21" y1="12" y2="15"/><path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59"/><path d="M21 15V5a2 2 0 0 0-2-2H9"/>
      </svg>
      <span class="text-sm font-medium tracking-wide opacity-80 transition-opacity duration-200 group-hover:opacity-100">이미지를 불러올 수 없습니다.</span>
      <span class="text-xs opacity-60 mt-1">주소가 잘못되었거나 원본 파일이 삭제되었을 수 있습니다.</span>
    `;

    if (target.parentNode) {
      target.parentNode.replaceChild(fallbackDiv, target);
    }
  }
};

/**
 * 특정 컨테이너 레벨에서 이미지 에러를 캡처링 단계에서 낚아챕니다.
 */
export const initImageFallback = (container?: HTMLElement | null) => {
  const target = container || window;
  // error 이벤트는 버블링되지 않으므로 세 번째 인자 useCapture를 true로 설정해야 한다.
  target.addEventListener("error", handleImgError, true);
};

export const cleanupImageFallback = (container?: HTMLElement | null) => {
  const target = container || window;
  target.removeEventListener("error", handleImgError, true);
};
