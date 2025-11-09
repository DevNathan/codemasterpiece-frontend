import "client-only";

import { PaginationMeta } from "@/shared/type/PaginationMeta";

/**
 * 페이지네이션 객체를 기반으로 화면에 표시할 페이지 번호 목록을 생성합니다.
 *
 * 현재 페이지를 기준으로 앞뒤 최대 2개씩의 페이지를 표시하며,
 * 시작이나 끝에 여백이 생기면 첫 페이지(1)와 마지막 페이지(endPage)를 추가로 표시하고,
 * 중간 생략 부분은 "ellipsis"로 대체합니다.
 *
 * @param {PaginationType} pagination - 페이지네이션 정보 객체
 * @param {number} pagination.currentPage - 현재 페이지 번호
 * @param {number} pagination.endPage - 전체 페이지의 마지막 번호
 *
 * @returns {string[]} 페이지 번호 문자열 배열
 * - 실제 페이지 번호는 문자열로 반환됩니다.
 * - 생략 구간은 "ellipsis" 문자열로 표시됩니다.
 *
 * @example
 * getPageNumbers({ currentPage: 6, endPage: 10 });
 * // 반환값: ['1', 'ellipsis', '4', '5', '6', '7', '8', 'ellipsis', '10']
 */
export default function getPageNumbers(pagination: PaginationMeta): string[] {
  const { currentPage, pageEnd } = pagination;

  const pages: string[] = [];

  let adjustedStartPage = currentPage - 2;
  let adjustedEndPage = currentPage + 2;

  if (adjustedStartPage < 1) {
    adjustedStartPage = 1;
    adjustedEndPage = Math.min(5, pageEnd);
  } else if (adjustedEndPage > pageEnd) {
    adjustedEndPage = pageEnd;
    adjustedStartPage = Math.max(1, pageEnd - 4);
  }

  if (adjustedStartPage > 1) {
    pages.push("1");
    if (adjustedStartPage > 2) {
      pages.push("ellipsis");
    }
  }

  for (let i = adjustedStartPage; i <= adjustedEndPage; i++) {
    pages.push(i.toString());
  }

  if (adjustedEndPage < pageEnd) {
    if (adjustedEndPage < pageEnd - 1) {
      pages.push("ellipsis");
    }
    pages.push(pageEnd.toString());
  }

  return pages;
}
