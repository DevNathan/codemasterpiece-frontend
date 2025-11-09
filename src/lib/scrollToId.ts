export function scrollToId(id: string, offset = 0) {
  const el = document.getElementById(id);
  if (!el) return;

  const prev = (history as any).scrollRestoration;
  try {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    history.replaceState(null, "", `#${id}`);

    // sticky 헤더 높이만큼 보정한 정밀 스크롤
    const top =
      el.getBoundingClientRect().top + window.scrollY - Math.max(0, offset);

    // 첫 해시 전환에서 브라우저/Next가 개입할 수 있으니 rAF 두 번 안전빵
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top, behavior: "smooth" });
      });
    });
  } finally {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = prev ?? "auto";
    }
  }
}
