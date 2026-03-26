import katex from "katex";

/**
 * 컨테이너 내의 수식(.math-inline, .math-display)을 찾아 KaTeX로 렌더링합니다.
 */
export function renderMathInElement(container: HTMLElement) {
  if (!container) return;

  // 1. 블록 수식 렌더링 ($$ ... $$)
  const displayMathElements = container.querySelectorAll(".math-display");
  displayMathElements.forEach((el) => {
    if (el.getAttribute("data-math-rendered") === "yes") return;

    let text = el.textContent || "";
    text = text.trim();

    if (text.startsWith("$$") && text.endsWith("$$")) {
      text = text.slice(2, -2);
    }

    try {
      katex.render(text, el as HTMLElement, {
        displayMode: true,
        throwOnError: false,
      });
      el.setAttribute("data-math-rendered", "yes");
    } catch (e) {
      console.error("KaTeX display render error:", e);
    }
  });

  // 2. 인라인 수식 렌더링 ($ ... $)
  const inlineMathElements = container.querySelectorAll(".math-inline");
  inlineMathElements.forEach((el) => {
    if (el.getAttribute("data-math-rendered") === "yes") return;

    let text = el.textContent || "";
    text = text.trim();

    if (text.startsWith("$") && text.endsWith("$")) {
      text = text.slice(1, -1); // 껍데기 $ 제거
    }

    try {
      katex.render(text, el as HTMLElement, {
        displayMode: false,
        throwOnError: false,
      });
      el.setAttribute("data-math-rendered", "yes");
    } catch (e) {
      console.error("KaTeX inline render error:", e);
    }
  });
}
