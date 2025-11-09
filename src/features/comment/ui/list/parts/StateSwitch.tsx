"use client";
import { ReactNode } from "react";

type Props = {
  loading: boolean;
  error: unknown;
  empty: boolean;
  loadingView: ReactNode;
  errorView: ReactNode;
  emptyView: ReactNode;
  children: ReactNode | (() => ReactNode);
};

export default function StateSwitch({
  loading,
  error,
  empty,
  loadingView,
  errorView,
  emptyView,
  children,
}: Props) {
  if (loading) return <>{loadingView}</>;
  if (error) return <>{errorView}</>;
  if (empty) return <>{emptyView}</>;
  return (
    <>
      {typeof children === "function"
        ? (children as () => ReactNode)()
        : children}
    </>
  );
}
