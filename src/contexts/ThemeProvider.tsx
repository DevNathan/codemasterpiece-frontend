"use client";

import React, { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { CodeThemeProvider } from "@/contexts/CodeThemeProvider";
import { PointThemeProvider } from "@/contexts/PointThemeProvider";

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NextThemesProvider
      attribute={"class"}
      defaultTheme={"system"}
      enableSystem={true}
      disableTransitionOnChange={false}
    >
      <PointThemeProvider>
        <CodeThemeProvider>{children}</CodeThemeProvider>
      </PointThemeProvider>
    </NextThemesProvider>
  );
};

export default ThemeProvider;
