"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import type { AppUser } from "@/features/auth/types/AppUser";
import SessionKeepAliveGate from "@/features/auth/ui/SessionKeepAliveGate";
import authMe from "@/features/auth/api/authMe";

/**
 * 사용자 인증 정보 및 관련 상태 제어 함수들을 포함하는 컨텍스트 타입 정의입니다.
 */
type UserContextType = {
  user: AppUser | null;
  setUser: (u: AppUser | null) => void;
  isAuthenticated: boolean;
  isAuthor: boolean;
  refetchMe: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * @component UserContextProvider
 * @description
 * 애플리케이션의 사용자 인증 상태를 전역적으로 관리하는 프로바이더입니다.
 * React Compiler의 'set-state-in-effect' 경고를 방지하기 위해
 * 초기 동기화 로직을 비동기 함수로 격리하여 렌더링 사이클을 보호합니다.
 */
export function UserContextProvider({ children }: { children: ReactNode }) {
  // SSR 환경과의 하이드레이션 일관성을 유지하기 위해 초기값은 항상 null로 설정합니다.
  const [user, setUser] = useState<AppUser | null>(null);

  const isAuthenticated = !!user;
  const isAuthor = user?.role === "AUTHOR";

  /**
   * @function refetchMe
   * @description 현재 세션의 유저 정보를 API 서버로부터 다시 확인하고 상태를 갱신합니다.
   */
  const refetchMe = useCallback(async () => {
    try {
      const me = await authMe();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  /**
   * 컴포넌트 마운트 시점에 유저 정보를 동기화합니다.
   * - HttpOnly로 설정된 세션 쿠키는 클라이언트에서 직접 확인할 수 없으므로 API를 호출하여 세션을 검증합니다.
   * - 동기적인 setState 호출로 인한 연쇄 렌더링(Cascading Render)을 방지하기 위해 비동기 처리(await) 후 상태를 업데이트합니다.
   */
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const me = await authMe();
        if (isMounted) setUser(me);
      } catch {
        if (isMounted) setUser(null);
      }
    };

    void initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<UserContextType>(
    () => ({ user, setUser, isAuthenticated, isAuthor, refetchMe }),
    [user, isAuthenticated, isAuthor, refetchMe],
  );

  return (
    <UserContext.Provider value={value}>
      {isAuthenticated && <SessionKeepAliveGate />}
      {children}
    </UserContext.Provider>
  );
}

/**
 * @function useAuth
 * @description 유저 인증 컨텍스트를 사용하기 위한 커스텀 훅입니다.
 * @throws {Error} UserContextProvider 외부에서 사용될 경우 예외를 발생시킵니다.
 */
export function useAuth(): UserContextType {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useAuth must be used within the context");
  return ctx;
}
