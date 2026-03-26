import type { Metadata } from "next";
import "@/app/globals.css";
import React, { Suspense } from "react";
import Providers from "@/app/providers";
import { siteMetadata } from "@/app/metadata";
import PageViewBeacon from "@/features/analytics/api/PageViewBeacon";
import { Abril_Fatface, Noto_Sans_KR, Roboto } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { WebVitals } from "@/shared/components/WebVitals";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  ...siteMetadata,
  metadataBase: new URL("https://codemasterpiece.com"),
  description: "Code Masterpiece - Build, Break, Understand.",
  verification: {
    google: "SuTXd_832EgP4hkw5Z3PhYnnE6c-_T_DV9PTCkP-da8",
  },
};
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`
          ${roboto.variable}
          font-sans
        `}
      >
        <Analytics />
        <SpeedInsights />
        <WebVitals />

        <NextTopLoader
          color="color-mix(in srgb, hsl(var(--point)), black 50%)"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px hsl(var(--point)),0 0 5px hsl(var(--point))"
        />
        <Suspense>
          <PageViewBeacon />
        </Suspense>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
