"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/shadcn/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/shadcn/avatar";
import { Badge } from "@/shared/components/shadcn/badge";
import { cn } from "@/lib/utils";
import { AUTHOR } from "@/lib/constants/author";
import { SiGithub, SiNotion } from "react-icons/si";
import { MapPin } from "lucide-react";

/**
 * AuthorBox — Minimal Redesign
 * - 단 하나의 액션 영역: 아이콘(깃허브/노션)만 링크
 * - 제목/이름은 링크 아님 → 중복 링크 제거
 * - 내부 상수 AUTHOR만 사용 (서버콜 X)
 */

type Props = { className?: string };

const AuthorBox: React.FC<Props> = ({ className }) => {
  const { name, login, avatar_url, github_url, notion_url, bio, blog, location } = AUTHOR as {
    name?: string;
    login: string;
    avatar_url: string;
    github_url: string;
    notion_url?: string;
    bio?: string;
    blog?: string;
    location?: string;
  };

  return (
    <Card className={cn("relative mt-12 overflow-hidden border-border/60", className)}>
      {/* soft gradient rim */}
      <div className="pointer-events-none absolute -inset-0.5 rounded-3xl opacity-15 [mask-image:radial-gradient(38%_42%_at_10%_0%,#000_20%,transparent_60%)] bg-gradient-to-br from-primary/40 via-sky-400/20 to-fuchsia-400/20" />

      <CardHeader className="relative flex flex-row items-start gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary/50 to-fuchsia-400/50 blur-sm opacity-40" />
          <Avatar className="size-16 relative">
            <AvatarImage src={avatar_url} alt={name ?? login} />
            <AvatarFallback>{(name ?? login).slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg truncate">{name ?? login}</CardTitle>
          <div className="text-sm text-muted-foreground truncate">@{login}</div>

          {/* meta */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {location && (
              <Badge variant="secondary" className="inline-flex items-center gap-1">
                <MapPin className="size-3" /> {location}
              </Badge>
            )}
            {blog && (
              <a
                href={normalizeUrl(blog)}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                {safeHost(blog)}
              </a>
            )}
          </div>
        </div>

        {/* single action area — icons only */}
        <div className="flex items-center gap-1.5 ml-2">
          <IconLink href={github_url} label="GitHub">
            <SiGithub className="size-4" />
          </IconLink>
          {notion_url && (
            <IconLink href={notion_url} label="Notion">
              <SiNotion className="size-4" />
            </IconLink>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative">
        {bio ? (
          <p
            className="text-sm leading-relaxed text-foreground/90 break-words"
            dangerouslySetInnerHTML={{ __html: bio }}
          />
        ) : (
          <p className="text-sm leading-relaxed text-foreground/90">소개가 아직 없네요. 곧 채워질 무드다.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthorBox;

// --- helpers ---
function normalizeUrl(url: string) {
  return url.startsWith("http") ? url : `https://${url}`;
}

function safeHost(url: string) {
  try {
    const u = new URL(normalizeUrl(url));
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// --- tiny icon link button ---
const IconLink: React.FC<{ href: string; label: string; children: React.ReactNode }> = ({ href, label, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    aria-label={label}
    className={cn(
      "inline-flex items-center justify-center rounded-full p-2",
      "hover:bg-muted transition border border-transparent hover:border-border/60"
    )}
  >
    {children}
  </a>
);
