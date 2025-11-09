import type { Metadata } from "next";

export const siteMetadata: Metadata = {
  title: {
    default: "CodeMasterpiece",
    template: "%s | CodeMasterpiece",
  },
  description:
    "개발과 디자인, 두 세계를 잇는 공간. 코드로 예술을 만들고, 생각을 기록하는 블로그입니다.",
  authors: [{ name: "DevNathan", url: "https://github.com/DevNathan" }],
  keywords: [
    "CodeMasterpiece",
    "코드마스터피스",
    "웹개발",
    "디자인",
    "프론트엔드",
    "백엔드",
    "풀스택",
    "기술 블로그",
    "Next.js",
    "Spring Boot",
  ],
  creator: "DevNathan",
  publisher: "CodeMasterpiece",
  metadataBase: new URL("https://www.codemasterpiece.com"),
  alternates: {
    canonical: "https://www.codemasterpiece.com",
    languages: {
      "ko-KR": "https://www.codemasterpiece.com",
    },
  },
  openGraph: {
    title: "CodeMasterpiece",
    description:
      "개발과 디자인, 두 세계를 잇는 공간. 코드로 예술을 만들고, 생각을 기록하는 블로그입니다.",
    url: "https://www.codemasterpiece.com",
    siteName: "CodeMasterpiece",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeMasterpiece",
    description:
      "코드로 예술을 만들고, 생각을 기록하는 공간. 개발자 DevNathan의 기술 블로그.",
    site: "@DevNathan",
    creator: "@DevNathan",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
