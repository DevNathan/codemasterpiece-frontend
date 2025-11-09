import { useMemo, useRef } from "react";

const TOKEN_RE =
  /!\[[^\]]*]\(file:\/\/(FL-[A-Z0-9]{26})(?:\?t=([\w\-_.]+))?\)/g;

function ensureTrailingSlash(u: string) {
  if (!u) return u;
  return u.endsWith("/") ? u : `${u}/`;
}

/** baseDirUrl이 우연히 .../original/ 이나 .../variants/ 로 들어오면 잘라서 ULID/까지만 남긴다 */
function normalizeBaseDir(u: string) {
  let v = ensureTrailingSlash(u.trim());
  // .../ULID/original/  -> .../ULID/
  // .../ULID/variants/ -> .../ULID/
  v = v.replace(/\/(original|variants)\/$/i, "/");
  return v;
}

type Cache = Map<string, string>;

export function useImageTokenResolver() {
  const cacheRef = useRef<Cache>(new Map());

  const setCache = (fileId: string, baseDirUrl: string) => {
    if (!fileId || !baseDirUrl) return;
    cacheRef.current.set(fileId, normalizeBaseDir(baseDirUrl));
  };

  const resolveTokens = (markdown: string): string => {
    if (!markdown) return markdown;

    return markdown.replace(TOKEN_RE, (match, id: string, t?: string) => {
      const base = cacheRef.current.get(id);
      if (!base) return match;

      // base: .../ULID/
      const url = t ? `${base}variants/${t}` : `${base}original`;
      const needle = t ? `file://${id}?t=${t}` : `file://${id}`;
      return match.replace(needle, url);
    });
  };

  const rewrite = (markdown: string) => resolveTokens(markdown);

  const collectIds = (markdown: string): string[] => {
    if (!markdown) return [];
    const ids = new Set<string>();
    for (const m of markdown.matchAll(TOKEN_RE)) ids.add(m[1]);
    return [...ids];
  };

  return useMemo(() => ({ setCache, resolveTokens, rewrite, collectIds }), []);
}
