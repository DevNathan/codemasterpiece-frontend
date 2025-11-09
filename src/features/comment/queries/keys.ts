export type ActorKey =
  | { type: "user"; id: string }
  | { type: "client"; id: string }
  | { type: "none" };

export const commentKeys = {
  all: ["comments"] as const,

  page: (p: {
    postId: string
    page: number;
    size: number;
    actor: ActorKey;
    elevated: boolean;
  }) =>
    [
      ...commentKeys.all,
      "page",
      {
        "post-id": p.postId,
        page: p.page,
        size: p.size,
        actor: p.actor,
        elevated: p.elevated,
      },
    ] as const,
};
