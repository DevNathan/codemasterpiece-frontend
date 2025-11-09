export function slugifyId(input: string) {
  if (!input) return "";

  // 1) 유니코드 정규화(NFKD) 후 결합 문자 제거 (악센트 등)
  const normalized = input.normalize("NFKD").replace(/\p{M}+/gu, "");

  // 2) 소문자화 (로케일 영향 최소화)
  const lower = normalized.toLowerCase();

  // 3) 허용 문자: 문자(모든 스크립트) + 숫자 + 하이픈
  //    공백류는 하이픈으로 치환
  const spacedToDash = lower.replace(/[\p{Zs}\s]+/gu, "-");

  // 4) 나머지 기호 제거 (문자 · 숫자 · 하이픈만 남김)
  const stripped = spacedToDash.replace(/[^\p{L}\p{N}-]+/gu, "");

  // 5) 하이픈 정리
  return stripped.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}
