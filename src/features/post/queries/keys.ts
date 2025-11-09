export type ActorKey =
  | { type: "user"; id: "auth" }
  | { type: "client"; id: string }
  | { type: "none"; id: "0" };

export const actorFrom = (hasSession: boolean, clientId?: string): ActorKey => {
  if (hasSession) return { type: "user", id: "auth" };
  if (clientId && clientId.length > 0) return { type: "client", id: clientId };
  return { type: "none", id: "0" };
};

export const postKeys = {
  all: ["posts"] as const,

  page: (p: {
    page: number;
    size: number;
    sortKey: "createdAt" | "updatedAt" | "title" | "viewCount" | "likeCount";
    sortDir: "ASC" | "DESC";
    link?: string | null;
    actor: ActorKey;
  }) =>
    [
      ...postKeys.all,
      "page",
      {
        page: p.page,
        size: p.size,
        sortKey: p.sortKey,
        sortDir: p.sortDir,
        link: p.link ?? null,
        actor: p.actor,
      },
    ] as const,

  detail: (p: { slug: string; actor: ActorKey }) =>
    [...postKeys.all, "detail", { slug: p.slug, actor: p.actor }] as const,
};
