"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

type Props = {
  children: ReactNode;
};

function RQProvider({ children }: Props) {
  const [client] = useState(
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          refetchOnWindowFocus: false, // 다른 윈도우 탭 갔다 오면 다시 데이터를 가져오겠다
          refetchOnReconnect: true, // 인터넷 연결이 끊겼다가 다시 연결되는 순간 가져온다
          refetchOnMount: false,
          retryOnMount: true, // 리액트에 컴포넌트가 언마운트 되었다가 다시 마운트 되면 데이터를 가져온다
          retry: false, // 실패시 몇번 더 가져올 것인가, false 를 하면 에러페이지 보여줌
        },
      },
    }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default RQProvider;
