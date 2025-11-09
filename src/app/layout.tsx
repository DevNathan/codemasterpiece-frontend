import type { Metadata } from "next";
import "./globals.css";
import React, { Suspense } from "react";
import Providers from "@/app/providers";
import { siteMetadata } from "@/app/metadata";
import PageViewBeacon from "@/features/analytics/api/PageViewBeacon";

export const metadata: Metadata = {
  ...siteMetadata,
  metadataBase: new URL("https://codemasterpiece.com"),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="SuTXd_832EgP4hkw5Z3PhYnnE6c-_T_DV9PTCkP-da8"
        />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body>
        <Suspense>
          <PageViewBeacon />
        </Suspense>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
