import { ulid } from "ulid";

export function getClientId(): string {
  const m = document.cookie.match(/(?:^|; )client-id=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : ""; // proxy가 선행되므로 빈값이면 비정상
}

export function getSessionId(): string {
  const k = "session-id";
  let sid = sessionStorage.getItem(k);
  if (!sid) {
    sid = `SE-${ulid()}`;
    sessionStorage.setItem(k, sid);
  }
  return sid;
}
