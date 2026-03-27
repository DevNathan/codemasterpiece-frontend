import type { Metadata } from "next";
import Script from "next/script";
import React from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getQueryClient } from "@/lib/getQueryClient";
import { COOKIES } from "@/lib/constants/cookies";
import getPostDetailServer from "@/features/post/api/getPostDetailServer";
import {
  actorFrom,
  type ActorKey,
  postKeys,
} from "@/features/post/queries/keys";
import PostDetailView from "@/features/post/ui/detail/PostDetailView";

const SITE_URL = "https://codemasterpiece.com";
const SITE_NAME = "Code Masterpiece";
const SITE_LOCALE = "ko_KR";
const AUTHOR = "DevNathan";

const abs = (u?: string) => {
  if (!u) return undefined;
  if (u.startsWith("http")) return u;
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("/")) return `${SITE_URL}${u}`;
  return `${SITE_URL}/${u}`;
};

const snippet = (html: string, max = 160) => {
  if (!html) return "";
  const text = html
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;|&lt;|&gt;|&amp;|&quot;|&apos;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const dto = await getPostDetailServer(slug);

    const title = dto.title;
    const rawTextForSnippet = dto.headContent || dto.mainContent || "";

    const description =
      snippet(rawTextForSnippet, 160) ||
      `${title} - Code Masterpiece에서 확인해보세요.`;

    const url = `${SITE_URL}/post/${encodeURIComponent(slug)}`;
    const ogImage =
      abs(dto.headImage) ||
      `${SITE_URL}/api/og/post?title=${encodeURIComponent(dto.title)}`;

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
        publishedTime: dto.createdAt,
        modifiedTime: dto.updatedAt,
        tags: dto.tags,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ogImage ? [ogImage] : undefined,
      },
      robots: { index: dto.published, follow: dto.published },
      other: { "article:category": dto.categoryName },
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
  const clientId = cookieStore.get(COOKIES.CLIENT_ID)?.value;
  const actor: ActorKey = actorFrom(hasSession, clientId);

  const qc = getQueryClient();

  try {
    const dto = await getPostDetailServer(slug);

    if (!dto) notFound();

    const { mainContent: _mainContent, toc: _toc, ...optimizedDto } = dto;
    qc.setQueryData(postKeys.detail({ slug, actor }), optimizedDto);

    const rawTextForSnippet = dto.headContent || dto.mainContent || "";
    const jsonLd = {
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
      description:
        snippet(rawTextForSnippet, 200) ||
        `${dto.title}에 대한 상세 포스트입니다.`,
    };

    return (
      <HydrationBoundary state={dehydrate(qc)}>
        <Script
          id="post-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PostDetailView
          slug={slug}
          parsedHtml={dto.mainContent}
          toc={dto.toc}
          actor={actor}
        />
      </HydrationBoundary>
    );
  } catch {
    notFound();
  }
}
