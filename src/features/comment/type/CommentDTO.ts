import { z } from "zod";
import { CommentReaction } from "@/features/comment/type/ReactionType";

export type CommentDTO = {
  commentId: string;
  parentId: string | null;
  actorId: string;
  profileImage: string;
  nickname: string;
  content: string;
  reaction: number;
  myReaction: CommentReaction;
  depth: number;
  createdAt: string;
  updatedAt: string;
  hidden: boolean;
  deleted: boolean;
  anon: boolean;
  hasChildren: boolean;
  children: CommentDTO[];
};


export const CommentDTOSchema: z.ZodType<CommentDTO> = z.lazy(() =>
  z.object({
    commentId: z.string(),
    parentId: z.string().nullable(),
    actorId: z.string(),
    profileImage: z.string(),
    nickname: z.string(),
    content: z.string(),
    reaction: z.number(),
    myReaction: z.union([z.literal("UPVOTE"), z.literal("DOWNVOTE"), z.null()]),
    depth: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
    hidden: z.boolean(),
    deleted: z.boolean(),
    anon: z.boolean(),
    hasChildren: z.boolean(),
    children: z.array(CommentDTOSchema),
  }),
);