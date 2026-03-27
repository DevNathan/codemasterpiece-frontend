"use client";

import { useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import getPostDetail from "@/features/post/api/getPostDetail";
import type { PostDetailDTO } from "@/features/post/type/PostDetailDTO";
import { CookieManager } from "@/shared/module/cookieManager";
import { postKeys, type ActorKey } from "@/features/post/queries/keys";
import { COOKIES } from "@/lib/constants/cookies";
import { useAuth } from "@/contexts/UserContext";

type PostClientData = Omit<PostDetailDTO, "mainContent" | "toc">;

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
    gcTimeMs = 30 * 60 * 1000,
  } = opts;

  const params = useParams<{ slug?: string }>();
  const routeSlug = params?.slug;
  const slug = slugArg ?? routeSlug;

  const { user } = useAuth();
  const clientId = CookieManager.getItem(COOKIES.CLIENT_ID) ?? null;

  const localActor: ActorKey = useMemo(() => {
    if (user?.userId) return { type: "user", id: "auth" };
    if (clientId) return { type: "client", id: clientId };
    return { type: "none", id: "0" };
  }, [user?.userId, clientId]);

  const actor = actorOverride ?? localActor;

  const queryKey = useMemo(() => {
    if (!slug) return ["posts", "detail", "invalid"] as const;
    return postKeys.detail({ slug, actor });
  }, [slug, actor]);

  const qc = useQueryClient();

  const query = useQuery<PostClientData>({
    queryKey,
    enabled: Boolean(slug),
    queryFn: async () => {
      // 클라이언트는 무조건 본문을 제외(true)하고 가볍게 요청한다.
      const res = await getPostDetail(slug as string, true);
      const { mainContent: _m, toc: _t, ...clientData } = res.data!;
      return clientData;
    },
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
        queryFn: async () => {
          const res = await getPostDetail(targetSlug, true);
          const { mainContent: _m, toc: _t, ...clientData } = res.data!;
          return clientData;
        },
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
