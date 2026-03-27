import { useMemo } from "react";
import type { PostTocDTO } from "@/features/post/type/PostDetailDTO";

type NumberedTocDTO = PostTocDTO & { label: string };

/**
 * @function useNumberedTOC
 * @description 목차(TOC) 데이터를 입력받아 계층형 문서 번호(예: 1, 1.1, 1.2.1)가 포함된 배열을 반환하는 커스텀 훅입니다.
 * 중복 연산을 제거하고 의존성 무결성을 보장합니다.
 */
export function useNumberedTOC(headings?: PostTocDTO[]): NumberedTocDTO[] {
  return useMemo(() => {
    if (!headings || headings.length === 0) return [];

    const counters = [0, 0, 0, 0, 0, 0];

    return headings.map((h) => {
      const d = Math.min(Math.max(h.depth, 1), 6);
      counters[d - 1] += 1;
      for (let i = d; i < 6; i++) counters[i] = 0;
      const label = counters.slice(0, d).filter(Boolean).join(".");
      return { ...h, label };
    });
  }, [headings]);
}
