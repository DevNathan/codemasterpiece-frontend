"use client";

import { useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import getPostDetail from "@/features/post/api/getPostDetail";
import type { PostDetailDTO } from "@/features/post/type/PostDetailDTO";
import { CookieManager } from "@/shared/module/cookieManager";
import { postKeys, type ActorKey } from "@/features/post/queries/keys";
import { COOKIES } from "@/lib/constants/cookies";
import { useAuth } from "@/contexts/UserContext";

type UsePostOptions = {
  slug?: string;
  actor?: ActorKey;
  staleTimeMs?: number;
  gcTimeMs?: number;
};

export function usePost(opts: UsePostOptions = {}) {
  const {
    slug: slugArg,
    actor: actorOverride,
    staleTimeMs = 5 * 60 * 1000,
    gcTimeMs   = 30 * 60 * 1000,
  } = opts;

  const params = useParams<{ slug?: string }>();
  const routeSlug = params?.slug;
  const slug = slugArg ?? routeSlug;

  // 로컬 액터(폴백)
  const { user } = useAuth();
  const clientId = CookieManager.getItem(COOKIES.CLIENT_ID) ?? null;

  const localActor: ActorKey = useMemo(() => {
    if (user?.userId) return { type: "user", id: "auth" };
    if (clientId)      return { type: "client", id: clientId };
    return { type: "none", id: "0" };
  }, [user?.userId, clientId]);

  // 최종 actor: 서버 override → 로컬
  const actor = actorOverride ?? localActor;

  const queryKey = useMemo(() => {
    if (!slug) return ["posts", "detail", "invalid"] as const;
    return postKeys.detail({ slug, actor });
  }, [slug, actor]);

  const qc = useQueryClient();

  const query = useQuery<PostDetailDTO>({
    queryKey,
    enabled: Boolean(slug),
    queryFn: async () => (await getPostDetail(slug as string)).data!,
    staleTime: staleTimeMs,
    gcTime: gcTimeMs,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const prefetch = useCallback(
    async (targetSlug: string) => {
      const key = postKeys.detail({ slug: targetSlug, actor });
      await qc.prefetchQuery({
        queryKey: key,
        queryFn: async () => (await getPostDetail(targetSlug)).data!,
        staleTime: staleTimeMs,
      });
    },
    [qc, actor, staleTimeMs],
  );

  const invalidate = useCallback(async () => {
    if (!slug) return;
    await qc.invalidateQueries({ queryKey: postKeys.detail({ slug, actor }) });
  }, [qc, slug, actor]);

  return { ...query, slug, actor, prefetch, invalidate };
}
