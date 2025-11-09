"use client";

import { ReactNode } from "react";

export default function PageSectionShell({
  children,
  sectionRef,
}: {
  children: ReactNode;
  sectionRef: any;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20" ref={sectionRef}>
      <div className="h-14" />
      {children}
    </div>
  );
}
