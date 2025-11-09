export const analyticKeys = {
  all: ["analytics"] as const,
  visitors: (type: "day" | "week" | "month", from: string, to: string) =>
    [...analyticKeys.all, "visitors", type, from, to] as const,
};
