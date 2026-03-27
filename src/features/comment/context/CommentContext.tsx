"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { useAuth } from "@/contexts/UserContext";
import { CookieManager } from "@/shared/module/cookieManager";
import { COOKIES } from "@/lib/constants/cookies";
import type { CommentPageResponse } from "@/features/comment/type/CommentPageResponse";
import type { CommentDTO } from "@/features/comment/type/CommentDTO";
import {
  type CommentReaction,
  reactToComment,
} from "@/features/comment/api/reactToComment";
import toggleHideApi from "@/features/comment/api/toggleHide";
import { isSuccess } from "@/lib/api/clientFetch";
import { toast } from "sonner";
import { formatKoreanDateTime } from "@/lib/util/timeFormatter";
import { ActorKey } from "@/features/comment/queries/keys";
import { UseFormReturn } from "react-hook-form";
import deleteComment from "@/features/comment/api/deleteComment";
import getCommentPage from "@/features/comment/api/getCommentPage";

// ──────────────────────────────────────────────
// 정적 유틸리티 (컴포넌트 외부 배치로 참조 무결성 보장)
// ──────────────────────────────────────────────

/** 리액션 변경에 따른 카운트 변화량을 계산합니다. */
const voteDelta = (from: CommentReaction, to: CommentReaction) => {
  if (from === to) return 0;
  if (from === null && to === "UPVOTE") return +1;
  if (from === null && to === "DOWNVOTE") return -1;
  if (from === "UPVOTE" && to === null) return -1;
  if (from === "DOWNVOTE" && to === null) return +1;
  if (from === "UPVOTE" && to === "DOWNVOTE") return -2;
  if (from === "DOWNVOTE" && to === "UPVOTE") return +2;
  return 0;
};

/** 응답 데이터에서 루트 댓글 목록을 추출합니다. */
const getRoots = (pageData: CommentPageResponse): CommentDTO[] =>
  (pageData as any).content ?? (pageData as any).items ?? [];

/** 댓글 목록을 포함한 새로운 응답 객체를 생성합니다. */
const cloneWithRoots = (
  pageData: CommentPageResponse,
  roots: CommentDTO[],
): CommentPageResponse =>
  "content" in (pageData as any)
    ? { ...(pageData as any), content: roots }
    : { ...(pageData as any), items: roots };

/** 대댓글을 포함한 트리 구조 전체에 함수를 적용합니다. */
const mapTree = (
  nodes: CommentDTO[],
  fn: (n: CommentDTO) => CommentDTO,
): CommentDTO[] =>
  nodes.map((n) =>
    n.children?.length
      ? { ...fn(n), children: mapTree(n.children, fn) }
      : fn(n),
  );

type CommentContextType = {
  postId: string;
  actor: ActorKey;
  elevated: boolean;
  page: number;
  size: number;
  setPage: (p: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setSize: (s: number) => void;
  query: UseQueryResult<CommentPageResponse, Error>;
  invalidate: () => Promise<void>;
  applyNewComment: (
    comment: CommentDTO,
    parentId?: string | null,
  ) => Promise<void>;
  updateComment: (comment: CommentDTO) => Promise<void>;
  updateHidden: (commentId: string, hidden: boolean) => void;
  updateDeleted: (
    commentId: string,
    deleted: boolean,
    fallbackContent?: string,
  ) => void;
  updateReaction: (
    commentId: string,
    next: CommentReaction,
  ) => { prev: CommentReaction; delta: number };
  react: (commentId: string, next: CommentReaction) => Promise<void>;
  hide: (commentId: string, next: boolean) => Promise<void>;
  remove: (
    commentId: string,
    opts?: {
      form?: UseFormReturn<any>;
      needPassword?: boolean;
      password?: string;
      fallbackContent?: string;
    },
  ) => Promise<void>;
};

const CommentContext = createContext<CommentContextType | undefined>(undefined);

/**
 * @component CommentProvider
 * @description 댓글 데이터를 관리하고 실시간 동기화 및 낙관적 업데이트를 수행하는 컨텍스트 프로바이더입니다.
 */
export const CommentProvider = ({
  postId,
  enabled = true,
  elevated = false,
  initialPage = 1,
  initialSize = 5,
  children,
}: {
  postId: string;
  enabled?: boolean;
  elevated?: boolean;
  initialPage?: number;
  initialSize?: number;
  children: ReactNode;
}) => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const clientId = CookieManager.getItem(COOKIES.CLIENT_ID) ?? null;

  const [page, setPageState] = useState<number>(initialPage);
  const [size, setSizeState] = useState<number>(initialSize);

  /**
   * @description 현재 요청을 수행하는 주체(Actor) 정보를 메모이제이션합니다.
   * 리액트 컴파일러의 의존성 추론 방식에 맞춰 user 객체 전체를 의존성에 포함시킵니다.
   */
  const actor = useMemo<ActorKey>(() => {
    if (user?.userId) return { type: "user", id: String(user.userId) };
    if (clientId) return { type: "client", id: clientId };
    return { type: "none" };
  }, [user, clientId]);

  /** Actor 정보에 따른 고유 식별자 문자열을 생성합니다. */
  const actorKeyStr = useMemo(
    () => `${actor.type}:${"id" in actor ? (actor.id ?? "") : ""}`,
    [actor],
  );

  /**
   * @function keyOf
   * @description 페이지네이션된 댓글 쿼리 키를 생성합니다.
   */
  const keyOf = useCallback(
    (p: number, s: number) =>
      ["comments", "page", postId, p, s, actorKeyStr, elevated] as const,
    [postId, actorKeyStr, elevated],
  );

  const currentKey = keyOf(page, size);

  /** API 서버로부터 댓글 페이지 데이터를 가져오는 함수입니다. */
  const fetchPage = useCallback(
    async (p: number, s: number) =>
      (await getCommentPage({ postId, page: p, size: s })).data!,
    [postId],
  );

  /**
   * @function setPage
   * @description 현재 페이지를 변경하고 다음 데이터를 프리패치합니다.
   */
  const setPage = useCallback(
    (p: number) => {
      const nextPageNum = Math.max(1, p);
      setPageState(nextPageNum);

      const nextKey = keyOf(nextPageNum, size);
      qc.prefetchQuery({
        queryKey: nextKey,
        queryFn: () => fetchPage(nextPageNum, size),
        staleTime: 60_000,
      }).catch(() => void 0);

      qc.refetchQueries({ queryKey: nextKey, type: "active" }).catch(
        () => void 0,
      );
    },
    [qc, size, fetchPage, keyOf],
  );

  const nextPage = useCallback(() => setPage(page + 1), [setPage, page]);
  const prevPage = useCallback(
    () => setPage(Math.max(1, page - 1)),
    [setPage, page],
  );

  /**
   * @function setSize
   * @description 페이지당 댓글 노출 개수를 변경합니다.
   */
  const setSize = useCallback(
    (s: number) => {
      const nextSize = Math.max(1, s);
      setPageState(1);
      setSizeState(nextSize);
      const nextKey = keyOf(1, nextSize);
      qc.prefetchQuery({
        queryKey: nextKey,
        queryFn: () => fetchPage(1, nextSize),
        staleTime: 60_000,
      }).catch(() => void 0);
      qc.refetchQueries({ queryKey: nextKey, type: "active" }).catch(
        () => void 0,
      );
    },
    [qc, fetchPage, keyOf],
  );

  const query = useQuery({
    queryKey: currentKey,
    queryFn: () => fetchPage(page, size),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    enabled,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  }) as UseQueryResult<CommentPageResponse, Error>;

  const invalidate = useCallback(
    async () => qc.invalidateQueries({ queryKey: ["comments"] }),
    [qc],
  );

  /** 새 댓글 작성을 캐시에 즉시 반영(낙관적 업데이트)합니다. */
  const applyNewComment = useCallback(
    async (comment: CommentDTO, parentId?: string | null) => {
      const isReply = !!parentId;
      qc.setQueryData(currentKey, (old: CommentPageResponse | undefined) => {
        if (!old) return old;
        const roots = getRoots(old);

        if (isReply) {
          const addChild = (nodes: CommentDTO[]): CommentDTO[] =>
            nodes.map((n) =>
              n.commentId === parentId
                ? {
                    ...n,
                    hasChildren: true,
                    children: [...(n.children ?? []), comment],
                  }
                : n.children
                  ? { ...n, children: addChild(n.children) }
                  : n,
            );
          return cloneWithRoots(old, addChild(roots));
        }

        return cloneWithRoots(old, [comment, ...roots]);
      });

      await qc.invalidateQueries({
        predicate: ({ queryKey }) =>
          Array.isArray(queryKey) &&
          queryKey[0] === "comments" &&
          JSON.stringify(queryKey) !== JSON.stringify(currentKey),
      });
    },
    [qc, currentKey],
  );

  /** 댓글 수정 내용을 캐시에 반영합니다. */
  const updateComment = useCallback(
    async (incoming: CommentDTO) => {
      const targetId = incoming.commentId;

      qc.setQueryData(currentKey, (old: CommentPageResponse | undefined) => {
        if (!old) return old;
        const roots = getRoots(old);

        const replace = (nodes: CommentDTO[]): CommentDTO[] =>
          nodes.map((n) => {
            if (n.commentId === targetId) {
              const hasIncomingChildren =
                Array.isArray(incoming.children) &&
                incoming.children.length > 0;
              return {
                ...incoming,
                children: hasIncomingChildren
                  ? incoming.children
                  : (n.children ?? []),
                hasChildren: hasIncomingChildren
                  ? incoming.hasChildren
                  : n.hasChildren,
              };
            }
            if (n.children?.length)
              return { ...n, children: replace(n.children) };
            return n;
          });

        return cloneWithRoots(old, replace(roots));
      });

      await qc.invalidateQueries({
        predicate: ({ queryKey }) =>
          Array.isArray(queryKey) &&
          queryKey[0] === "comments" &&
          JSON.stringify(queryKey) !== JSON.stringify(currentKey),
      });
    },
    [qc, currentKey],
  );

  /** 댓글 숨김 상태를 캐시에 반영합니다. */
  const updateHidden = useCallback(
    (targetId: string, hidden: boolean) => {
      qc.setQueryData(currentKey, (old: CommentPageResponse | undefined) => {
        if (!old) return old;
        const roots = getRoots(old);
        const updated = mapTree(roots, (n) =>
          n.commentId === targetId ? { ...n, hidden } : n,
        );
        return cloneWithRoots(old, updated);
      });
    },
    [qc, currentKey],
  );

  /** 댓글 삭제 상태를 캐시에 반영합니다. */
  const updateDeleted = useCallback(
    (targetId: string, deleted: boolean, fallbackContent?: string) => {
      qc.setQueryData(currentKey, (old: CommentPageResponse | undefined) => {
        if (!old) return old;
        const roots = getRoots(old);
        const updated = mapTree(roots, (n) =>
          n.commentId === targetId
            ? { ...n, deleted, content: fallbackContent || n.content }
            : n,
        );
        return cloneWithRoots(old, updated);
      });
    },
    [qc, currentKey],
  );

  /** 리액션(추천/비추천) 변경을 캐시에 반영합니다. */
  const updateReaction = useCallback(
    (targetId: string, next: CommentReaction) => {
      let prev: CommentReaction = null;
      let delta = 0;

      qc.setQueryData(currentKey, (old: CommentPageResponse | undefined) => {
        if (!old) return old;
        const roots = getRoots(old);

        const walk = (nodes: CommentDTO[]): CommentDTO[] =>
          nodes.map((n) => {
            if (n.commentId === targetId) {
              prev = n.myReaction ?? null;
              delta = voteDelta(prev, next);
              return { ...n, myReaction: next, reaction: n.reaction + delta };
            }
            if (n.children?.length) return { ...n, children: walk(n.children) };
            return n;
          });

        return cloneWithRoots(old, walk(roots));
      });

      return { prev, delta };
    },
    [qc, currentKey],
  );

  /** 서버에 리액션 변경을 요청하고 결과에 따라 캐시를 보정합니다. */
  const react = useCallback(
    async (commentId: string, next: CommentReaction) => {
      const { prev } = updateReaction(commentId, next);
      try {
        const res = await reactToComment({ commentId, value: next });
        if (!isSuccess(res)) {
          updateReaction(commentId, prev);
          toast.error(res?.error?.message ?? "요청 중 오류가 발생했습니다.");
          return;
        }

        const server = res.data?.myReaction ?? null;
        if (server !== next) updateReaction(commentId, server);

        if (res.detail.message || res.timestamp) {
          toast.success(res.detail.message ?? "반영되었습니다.", {
            description: res.timestamp
              ? formatKoreanDateTime(new Date(res.timestamp))
              : undefined,
          });
        }
      } catch (e: any) {
        updateReaction(commentId, prev);
        toast.error(e?.message ?? "네트워크 오류가 발생했습니다.");
      }
    },
    [updateReaction],
  );

  /** 서버에 댓글 숨김 처리를 요청합니다. */
  const hide = useCallback(
    async (commentId: string, next: boolean) => {
      let prevHidden = false;
      qc.setQueryData(currentKey, (old: CommentPageResponse | undefined) => {
        if (!old) return old;
        const roots = getRoots(old);
        const updated = mapTree(roots, (n) => {
          if (n.commentId === commentId) {
            prevHidden = n.hidden;
            return { ...n, hidden: next };
          }
          return n;
        });
        return cloneWithRoots(old, updated);
      });

      try {
        const res = await toggleHideApi(commentId, next);
        if (!isSuccess(res)) {
          updateHidden(commentId, prevHidden);
          toast.error(res?.error?.message ?? "숨김 처리에 실패했어요.");
          return;
        }
        if (res.detail.message || res.timestamp) {
          toast.success(res.detail.message ?? "숨김 상태가 변경되었습니다.", {
            description: res.timestamp
              ? formatKoreanDateTime(new Date(res.timestamp))
              : undefined,
          });
        }
      } catch (e: any) {
        updateHidden(commentId, prevHidden);
        toast.error(e?.message ?? "네트워크 오류가 발생했습니다.");
      }
    },
    [qc, currentKey, updateHidden],
  );

  /** 서버에 댓글 삭제를 요청합니다. */
  const remove = useCallback(
    async (
      commentId: string,
      opts?: {
        form?: UseFormReturn<any>;
        needPassword?: boolean;
        password?: string;
        fallbackContent?: string;
      },
    ) => {
      const {
        form,
        needPassword = false,
        password: guestPassword,
        fallbackContent,
      } = opts || {};
      let prevDeleted = false;
      let prevContent = "";

      qc.setQueryData(currentKey, (old: CommentPageResponse | undefined) => {
        if (!old) return old;
        const roots = getRoots(old);
        const updated = mapTree(roots, (n) => {
          if (n.commentId === commentId) {
            prevDeleted = n.deleted;
            prevContent = n.content;
            return {
              ...n,
              deleted: true,
              content: fallbackContent ?? n.content,
            };
          }
          return n;
        });
        return cloneWithRoots(old, updated);
      });

      try {
        const res = await deleteComment(form ?? ({} as UseFormReturn<any>), {
          commentId,
          guestPassword,
          needPassword,
        });

        if (!isSuccess(res)) {
          qc.setQueryData(
            currentKey,
            (old: CommentPageResponse | undefined) => {
              if (!old) return old;
              const roots = getRoots(old);
              const rolled = mapTree(roots, (n) =>
                n.commentId === commentId
                  ? { ...n, deleted: prevDeleted, content: prevContent }
                  : n,
              );
              return cloneWithRoots(old, rolled);
            },
          );
          toast.error(res?.error?.message ?? "삭제에 실패했습니다.");
          return;
        }

        if (res.detail.message || res.timestamp) {
          toast.success(res.detail.message ?? "삭제되었습니다.", {
            description: res.timestamp
              ? formatKoreanDateTime(new Date(res.timestamp))
              : undefined,
          });
        }

        await qc.invalidateQueries({
          predicate: ({ queryKey }) =>
            Array.isArray(queryKey) &&
            queryKey[0] === "comments" &&
            JSON.stringify(queryKey) !== JSON.stringify(currentKey),
        });
      } catch (e: any) {
        qc.setQueryData(currentKey, (old: CommentPageResponse | undefined) => {
          if (!old) return old;
          const roots = getRoots(old);
          const rolled = mapTree(roots, (n) =>
            n.commentId === commentId
              ? { ...n, deleted: prevDeleted, content: prevContent }
              : n,
          );
          return cloneWithRoots(old, rolled);
        });
        toast.error(e?.message ?? "네트워크 오류가 발생했습니다.");
      }
    },
    [qc, currentKey],
  );

  const value = useMemo<CommentContextType>(
    () => ({
      postId,
      actor,
      elevated,
      page,
      size,
      setPage,
      nextPage,
      prevPage,
      setSize,
      query,
      invalidate,
      applyNewComment,
      updateComment,
      updateHidden,
      updateDeleted,
      updateReaction,
      react,
      hide,
      remove,
    }),
    [
      postId,
      actor,
      elevated,
      page,
      size,
      setPage,
      nextPage,
      prevPage,
      setSize,
      query,
      invalidate,
      applyNewComment,
      updateComment,
      updateHidden,
      updateDeleted,
      updateReaction,
      react,
      hide,
      remove,
    ],
  );

  return (
    <CommentContext.Provider value={value}>{children}</CommentContext.Provider>
  );
};

export const useCommentContext = () => {
  const ctx = useContext(CommentContext);
  if (!ctx)
    throw new Error("useCommentContext must be used within a CommentProvider");
  return ctx;
};
