"use client";

import React from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/shared/components/shadcn/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/shadcn/avatar";
import { Badge } from "@/shared/components/shadcn/badge";
import { cn } from "@/lib/utils";
import { SiGithub, SiNotion } from "react-icons/si";
import { MapPin } from "lucide-react";
import { AUTHOR } from "@/lib/constants/author";
import { motion, useReducedMotion } from "framer-motion";

const MyHoverCard: React.FC<{ className?: string; triggerLabel?: string }> = ({
  className,
  triggerLabel = "Nathan",
}) => {
  const {
    name,
    login,
    avatar_url,
    github_url,
    notion_url,
    bio,
    location,
    blog,
  } = AUTHOR;
  const reduce = useReducedMotion();

  const variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 6 },
    show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } },
  } as const;

  return (
    <HoverCard openDelay={80} closeDelay={100}>
      <HoverCardTrigger asChild>
        <a
          href={github_url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-1 font-medium text-point underline underline-offset-2 hover:opacity-90 transition",
            className,
          )}
          aria-label={`Open @${login} on GitHub`}
        >
          {triggerLabel}
        </a>
      </HoverCardTrigger>

      <HoverCardContent
        className={cn(
          "w-[22rem] p-4 rounded-2xl shadow-xl border border-border/60 bg-card/95 backdrop-blur",
          "relative overflow-hidden",
        )}
        align="start"
        sideOffset={10}
      >
        {/* Accent ring */}
        <div className="pointer-events-none absolute -inset-0.5 rounded-3xl opacity-20 [mask-image:radial-gradient(40%_40%_at_20%_0%,#000_20%,transparent_60%)] bg-gradient-to-br from-primary/40 via-sky-400/30 to-fuchsia-400/30" />

        <motion.div initial="hidden" animate="show" variants={variants}>
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary/60 to-fuchsia-400/60 blur-sm opacity-40" />
              <Avatar className="size-12 relative">
                <AvatarImage src={avatar_url} alt={name ?? login} />
                <AvatarFallback>
                  {(name ?? login).slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Text column */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold truncate text-foreground">
                    {name ?? login}
                  </h4>
                  <div className="text-xs text-muted-foreground truncate">
                    @{login}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full p-1.5 hover:bg-muted transition"
                    aria-label="Open GitHub profile"
                  >
                    <SiGithub className="size-4" />
                  </a>
                  <a
                    href={notion_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full p-1.5 hover:bg-muted transition"
                    aria-label="Open Notion"
                  >
                    <SiNotion className="size-4" />
                  </a>
                </div>
              </div>

              {/* Bio */}
              <p
                className="text-sm leading-snug text-muted-foreground break-words"
                dangerouslySetInnerHTML={{ __html: bio }}
              />

              {/* Meta */}
              <div className="flex items-center gap-2 flex-wrap">
                {location && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-1"
                  >
                    <MapPin className="size-3" /> {location}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default MyHoverCard;
