"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/shadcn/card";
import { Button } from "@/shared/components/shadcn/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/shadcn/avatar";
import {
  Activity,
  Bookmark,
  ExternalLink,
  Github,
  Heart,
  MessageSquareText,
  Trash2,
} from "lucide-react";

// --- Mock Data ---
const MOCK_USER = {
  nickname: "Gigachad_Dev",
  provider: "GitHub",
  role: "AUTHOR",
  avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
};

const MOCK_STATS = {
  bookmarks: 12,
  likes: 45,
  comments: 8,
};

const MOCK_ACTIVITY = [
  {
    id: 1,
    type: "bookmark",
    title: "React 19 컴파일러 완벽 해부",
    date: "2026-03-25",
  },
  {
    id: 2,
    type: "like",
    title: "Next.js App Router 아키텍처 패턴",
    date: "2026-03-20",
  },
  {
    id: 3,
    type: "like",
    title: "리팩토링: 나약한 코드를 도륙하는 법",
    date: "2026-03-15",
  },
];

const MOCK_COMMENTS = [
  {
    id: 1,
    postTitle: "React 19 컴파일러 완벽 해부",
    content: "진짜 상남자다운 설명이네요. Purity 규칙이 이제 이해가 갑니다.",
    date: "2026-03-26",
  },
  {
    id: 2,
    postTitle: "Next.js App Router 아키텍처 패턴",
    content: "이 글 보고 기존 Pages Router 전부 밀어버렸습니다.",
    date: "2026-03-21",
  },
];
// --------------------------------------------------

export default function MyPage() {
  return (
    <div className="container max-w-5xl py-10 space-y-8">
      {/* 1. Profile Hero Section (시각적 압도) */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-background shadow-sm">
        <div className="absolute inset-0 bg-linear-to-r from-point/20 via-background to-background" />
        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8">
          <Avatar className="w-28 h-28 border-4 border-background shadow-xl shrink-0 ring-2 ring-point/30">
            <AvatarImage src={MOCK_USER.avatarUrl} alt={MOCK_USER.nickname} />
            <AvatarFallback className="text-3xl font-black bg-accent text-accent-foreground">
              {MOCK_USER.nickname.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                {MOCK_USER.nickname}
              </h1>
              <span className="px-3 py-1 rounded-full bg-point/10 text-point text-xs font-bold tracking-widest uppercase border border-point/20">
                {MOCK_USER.role}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <Github className="w-4 h-4" />
              <span>Connected via {MOCK_USER.provider}</span>
              <span className="mx-2 text-border">•</span>
              <span>Zero Data Collection</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid Dashboard Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column (Stats & Quick Actions) */}
        <div className="md:col-span-4 space-y-6">
          <Card className="border-border/60 shadow-sm bg-gradient-to-br from-background to-accent/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-point" />
                Combat Record
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background shadow-sm">
                    <Bookmark className="w-4 h-4 text-foreground" />
                  </div>
                  <span className="font-semibold text-sm">Bookmarks</span>
                </div>
                <span className="text-lg font-black">
                  {MOCK_STATS.bookmarks}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background shadow-sm">
                    <Heart className="w-4 h-4 text-rose-500" />
                  </div>
                  <span className="font-semibold text-sm">Likes</span>
                </div>
                <span className="text-lg font-black">{MOCK_STATS.likes}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background shadow-sm">
                    <MessageSquareText className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="font-semibold text-sm">Comments</span>
                </div>
                <span className="text-lg font-black">
                  {MOCK_STATS.comments}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Content Management) */}
        <div className="md:col-span-8 space-y-6">
          {/* Recent Activity (Bookmarks & Likes mixed for dynamic feel) */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40">
              <CardTitle className="text-lg">Saved & Liked</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                View All
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {MOCK_ACTIVITY.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex items-center justify-between hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5">
                        {item.type === "bookmark" ? (
                          <Bookmark className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        ) : (
                          <Heart className="w-5 h-5 text-muted-foreground group-hover:text-rose-500 transition-colors" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-point transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.date}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 h-8 text-xs bg-background"
                    >
                      <ExternalLink className="w-3.5 h-3.5 sm:mr-1.5" />
                      <span className="hidden sm:inline">읽기</span>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comment Management */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40">
              <CardTitle className="text-lg">My Comments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {MOCK_COMMENTS.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 sm:p-5 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-point uppercase tracking-wide">
                        {comment.postTitle}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {comment.date}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed pl-3 border-l-2 border-muted-foreground/30">
                      {comment.content}
                    </p>
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
