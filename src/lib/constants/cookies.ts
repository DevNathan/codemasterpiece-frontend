export const COOKIES = {
  POLICY_ACK: "__policy_ack",
  POINT_THEME: "__point",
  CLIENT_ID: "client-id",
  SESSION_ID: "JSESSIONID",
} as const;

export type CookieKey = keyof typeof COOKIES;
