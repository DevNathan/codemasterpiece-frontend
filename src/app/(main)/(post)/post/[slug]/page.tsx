import type { Metadata } from "next";
import Script from "next/script";
import React from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { getQueryClient } from "@/lib/getQueryClient";
import { COOKIES } from "@/lib/constants/cookies";
import getPostDetailServer from "@/features/post/api/getPostDetailServer";
import { actorFrom, postKeys, type ActorKey } from "@/features/post/queries/keys";
import PostDetailView from "@/features/post/ui/detail/PostDetailView";

const SITE_URL = "https://codemasterpiece.com";
const SITE_NAME = "CodeMasterpiece";
const SITE_LOCALE = "ko_KR";
const AUTHOR = "DevNathan";

const abs = (u?: string) => {
  if (!u) return undefined;
  if (u.startsWith("http")) return u;
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("/")) return `${SITE_URL}${u}`;
  return `${SITE_URL}/${u}`;
};

const snippet = (md: string, max = 160) => {
  const text = md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[[^\]]*]\([^)]+\)/g, "")
    .replace(/[#>*_~`-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await getPostDetailServer(slug);
    const p = res.data!;
    const title = p.title;
    const description = snippet(p.headContent || p.mainContent || "", 160);
    const url = `${SITE_URL}/post/${encodeURIComponent(slug)}`;
    const ogImage =
      abs(p.headImage) || `${SITE_URL}/api/og/post?title=${encodeURIComponent(p.title)}`;

    return {
      title,
      description,
      alternates: { canonical: url, languages: { "ko-KR": url } },
      openGraph: {
        type: "article",
        siteName: SITE_NAME,
        locale: SITE_LOCALE,
        url,
        title,
        description,
        images: ogImage ? [{ url: ogImage }] : undefined,
        authors: [AUTHOR],
        publishedTime: p.createdAt,
        modifiedTime: p.updatedAt,
        tags: p.tags,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ogImage ? [ogImage] : undefined,
      },
      robots: { index: p.published, follow: p.published },
      other: { "article:category": p.categoryName },
    };
  } catch {
    return {
      title: "글을 찾을 수 없습니다",
      description: "요청하신 게시글이 존재하지 않습니다.",
      robots: { index: false, follow: false },
    };
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const cookieStore = await cookies();
  const hasSession = !!cookieStore.get(COOKIES.SESSION_ID)?.value;
  const clientId   = cookieStore.get(COOKIES.CLIENT_ID)?.value;
  const actor: ActorKey = actorFrom(hasSession, clientId); // ← 파생 식별자

  const qc = getQueryClient();

  let dto: Awaited<ReturnType<typeof getPostDetailServer>>["data"] | null = null;
  try {
    const res = await getPostDetailServer(slug);
    dto = res.data;
    // 서버에서도 같은 키
    qc.setQueryData(postKeys.detail({ slug, actor }), dto);
  } catch {
    notFound();
  }

  const jsonLd =
    dto && {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: dto.title,
      datePublished: dto.createdAt,
      dateModified: dto.updatedAt,
      inLanguage: "ko-KR",
      mainEntityOfPage: `${SITE_URL}/post/${encodeURIComponent(slug)}`,
      articleSection: dto.categoryName,
      keywords: dto.tags?.join(", "),
      image: abs(dto.headImage),
      author: { "@type": "Person", name: AUTHOR },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` },
      },
      description: snippet(dto.headContent || dto.mainContent || "", 200),
    };

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      {jsonLd && (
        <Script
          id="post-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {/* actor를 안전하게 전달 */}
      <PostDetailView slug={slug} actor={actor} />
    </HydrationBoundary>
  );
}
