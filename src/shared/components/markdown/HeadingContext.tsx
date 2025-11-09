"use client";

import React, { createContext, useContext } from "react";

export type HeadingMeta = {
  id: string;
  text: string;
  depth: 1 | 2 | 3 | 4 | 5 | 6;
};

type Ctx = {
  allocId: (baseText: string) => string;
  register: (h: HeadingMeta) => void;
};

const HeadingCtx = createContext<Ctx | null>(null);

export const useHeadingRegistry = () => {
  const ctx = useContext(HeadingCtx);
  if (!ctx) throw new Error("HeadingContext missing");
  return ctx;
};

export const HeadingProvider = ({
  children,
  value,
}: React.PropsWithChildren<{ value: Ctx }>) => (
  <HeadingCtx.Provider value={value}>{children}</HeadingCtx.Provider>
);
