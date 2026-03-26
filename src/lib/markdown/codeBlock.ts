import { toast } from "sonner";

/**
 * 코드 블록의 텍스트를 클립보드에 복사하고 UI 피드백을 제공합니다.
 * @param copyBtn 클릭된 복사 버튼 HTMLButtonElement
 */
export const handleCodeBlockCopy = (copyBtn: HTMLButtonElement) => {
  const wrapper = copyBtn.closest(".cm-codeblock-wrapper");
  const codeBlock = wrapper?.querySelector("pre code");

  if (!codeBlock) return;

  const text = codeBlock.textContent || "";
  const checkSvgHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  navigator.clipboard
    .writeText(text)
    .then(() => {
      const originalHTML = copyBtn.innerHTML;
      copyBtn.innerHTML = checkSvgHTML;
      copyBtn.classList.add("text-primary");

      toast.success("클립보드에 복사되었습니다.");

      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.classList.remove("text-primary");
      }, 1200);
    })
    .catch((err) => {
      console.error("클립보드 복사에 실패했습니다:", err);
      toast.error("복사에 실패했습니다.");
    });
};
