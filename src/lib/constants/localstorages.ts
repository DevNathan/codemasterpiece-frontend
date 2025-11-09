// src/lib/constants/localstorages.ts

export const LOCALS = {
  // 기존
  PREFER_C_SIZE: "prefer-comment-size",
  ANON_COMMENT: "anonymous-comment",

  // 임시저장(글쓰기)
  DRAFT_NEW_POST: "draft-post-new",
  DRAFT_EDIT_POST_PREFIX: "draft-post-", // 뒤에 postId 붙임

  // 미리보기
  PREVIEW_POST_PREFIX: "preview-post-",   // 뒤에 uuid 붙임
  PREVIEW_CHAN_PREFIX: "preview-chan-",   // 뒤에 동일 uuid 붙임(전달용 표기)
} as const;

export type LocalKey = keyof typeof LOCALS;
