export const categoryKeys = {
  all: ["category"] as const,
  tree: () => [...categoryKeys.all, "tree"] as const,
};
