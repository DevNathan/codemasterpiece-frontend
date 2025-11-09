import "client-only";
import { clientFetch } from "@/lib/api/clientFetch";

type ResponseType = {
  ok: boolean;
  expMs: number;
  serverTime: string;
};

export default async function sessionTouch(pingUrl: string) {
  return clientFetch<ResponseType>(pingUrl, {
    method: "GET",
  });
}
