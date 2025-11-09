// src/context/UserContext.tsx
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

type UserContextType = {
  user: AppUser | null;
  setUser: (u: AppUser | null) => void;
  isAuthenticated: boolean;
  isAuthor: boolean;
  refetchMe: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserContextProvider({ children }: { children: ReactNode }) {
  // SSR 결정성: 초기값은 항상 null
  const [user, setUser] = useState<AppUser | null>(null);

  const isAuthenticated = !!user;
  const isAuthor = user?.role === "AUTHOR";

  const refetchMe = useCallback(async () => {
    try {
      const me = await authMe();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  // 마운트 후 1회 동기화
  useEffect(() => {
    void refetchMe();
  }, [refetchMe]);

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

export function useAuth(): UserContextType {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useAuth must be used within the context");
  return ctx;
}
