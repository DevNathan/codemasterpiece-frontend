import { useCallback, useMemo, useRef } from "react";

const TOKEN_RE =
  /!\[[^\]]*]\(image-token:\/\/(FL-[A-Z0-9]{26})(?:\?t=([\w\-_.]+))?\)/g;

function ensureTrailingSlash(u: string) {
  if (!u) return u;
  return u.endsWith("/") ? u : `${u}/`;
}

function normalizeBaseDir(u: string) {
  let v = ensureTrailingSlash(u.trim());
  v = v.replace(/\/(original|variants)\/$/i, "/");
  return v;
}

type Cache = Map<string, string>;

/**
 * @function useImageTokenResolver
 * @description 마크다운 내의 이미지 토큰을 실제 URL로 치환하고 캐싱하는 기능을 제공하는 훅입니다.
 */
export function useImageTokenResolver() {
  const cacheRef = useRef<Cache>(new Map());

  /**
   * @function setCache
   * @description 파일 ID와 기본 디렉토리 URL을 매핑하여 로컬 캐시에 저장합니다.
   */
  const setCache = useCallback((fileId: string, baseDirUrl: string) => {
    if (!fileId || !baseDirUrl) return;
    cacheRef.current.set(fileId, normalizeBaseDir(baseDirUrl));
  }, []);

  /**
   * @function resolveTokens
   * @description 입력된 마크다운 문자열에서 이미지 토큰을 찾아 실제 캐싱된 URL로 치환합니다.
   */
  const resolveTokens = useCallback((markdown: string): string => {
    if (!markdown) return markdown;

    return markdown.replace(TOKEN_RE, (match, id: string, t?: string) => {
      const base = cacheRef.current.get(id);
      if (!base) return match;

      const url = t ? `${base}variants/${t}` : `${base}original`;
      const needle = t ? `image-token://${id}?t=${t}` : `image-token://${id}`;

      return match.replace(needle, url);
    });
  }, []);

  /**
   * @function rewrite
   * @description resolveTokens의 별칭 함수입니다.
   */
  const rewrite = useCallback(
    (markdown: string) => resolveTokens(markdown),
    [resolveTokens],
  );

  /**
   * @function collectIds
   * @description 주어진 마크다운 문자열에서 고유한 이미지 토큰 ID 목록을 추출합니다.
   */
  const collectIds = useCallback((markdown: string): string[] => {
    if (!markdown) return [];
    const ids = new Set<string>();
    for (const m of markdown.matchAll(TOKEN_RE)) ids.add(m[1]);
    return [...ids];
  }, []);

  /**
   * 반환되는 컨텍스트 객체의 의존성 무결성을 보장합니다.
   * 누락된 상태 업데이트 함수들을 모두 포함하여 React의 경고를 해결합니다.
   */
  return useMemo(
    () => ({ setCache, resolveTokens, rewrite, collectIds }),
    [setCache, resolveTokens, rewrite, collectIds],
  );
}
