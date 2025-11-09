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
import getCommentPage from "@/features/comment/api/getCommentPage";
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

/**
 * 댓글 조회/페이지네이션/캐싱 컨텍스트 데이터 형식
 * - react-query의 결과를 그대로 노출하여 유연하게 소비 가능
 * - 숨김, 삭제, 리액션 등 서버 변경 작업을 즉시 캐시에 반영함
 */
type CommentContextType = {
  /** 댓글이 속한 게시글 ID */
  postId: string;
  /** 액터(로그인 사용자/클라이언트/없음) */
  actor: ActorKey;
  /** 권한 상승 여부 (작성자/관리자) */
  elevated: boolean;

  /** 현재 페이지 (1-based) */
  page: number;
  /** 페이지 사이즈 */
  size: number;

  /** 페이지를 임의 숫자로 설정 (1 미만 방지, 즉시 prefetch/refetch) */
  setPage: (p: number) => void;
  /** 다음 페이지 이동 (즉시 prefetch/refetch) */
  nextPage: () => void;
  /** 이전 페이지 이동 (즉시 prefetch/refetch) */
  prevPage: () => void;
  /** 페이지 사이즈 변경 시 1페이지로 리셋 (즉시 prefetch/refetch) */
  setSize: (s: number) => void;

  /** react-query의 쿼리 객체 전체 (data/isLoading/error 등) */
  query: UseQueryResult<CommentPageResponse, Error>;

  /** 댓글 전역 캐시 무효화 (등록/삭제 후 강제 리로드 등에 사용) */
  invalidate: () => Promise<void>;

  /** 새 댓글을 캐시에 반영 (루트/대댓글 모두) — 현재 페이지에만 반영 */
  applyNewComment: (
    comment: CommentDTO,
    parentId?: string | null,
  ) => Promise<void>;

  /** 특정 댓글을 DTO로 교체 (children 비어오면 기존 children/hasChildren 유지) */
  updateComment: (comment: CommentDTO) => Promise<void>;

  /** 숨김 토글 결과를 현재 화면 캐시에 즉시 반영 */
  updateHidden: (commentId: string, hidden: boolean) => void;

  /** 삭제 결과를 현재 화면 캐시에 즉시 반영 (기본 콘텐츠는 "[deleted]") */
  updateDeleted: (
    commentId: string,
    deleted: boolean,
    fallbackContent?: string,
  ) => void;

  /** 리액션 즉시 반영 (낙관적 캐시 업데이트 전용) */
  updateReaction: (
    commentId: string,
    next: CommentReaction,
  ) => { prev: CommentReaction; delta: number };

  /** 리액션 낙관적 업데이트 + 서버 동기화 (롤백/보정 포함) */
  react: (commentId: string, next: CommentReaction) => Promise<void>;

  /** 숨김 토글(낙관적→서버→롤백) */
  hide: (commentId: string, next: boolean) => Promise<void>;

  /** 삭제(낙관적→서버→롤백) */
  remove: (
    commentId: string,
    opts?: {
      /** react-hook-form 인스턴스(삭제 다이얼로그 내부 폼) */
      form?: UseFormReturn<any>;
      /** 익명 + 소유자/Author 아님 → true */
      needPassword?: boolean;
      /** 사용자가 입력한 PIN(옵션, form이 있으면 자동 바인딩됨) */
      password?: string;
      /** UI에 즉시 반영할 임시 콘텐츠 */
      fallbackContent?: string;
    },
  ) => Promise<void>;
};

/** 내부 컨텍스트 */
const CommentContext = createContext<CommentContextType | undefined>(undefined);

/**
 * CommentProvider
 *
 * - Side-effect-free: useEffect 없음. 핸들러 내에서 prefetch/refetch.
 * - 초기 page/size는 prop으로 받고 이후 내부 상태가 소유(언컨트롤드).
 * - enabled로 페치 타이밍 제어.
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

  // ──────────────────────────────────────────────
  // 내부 상태 (언컨트롤드)
  // ──────────────────────────────────────────────
  const [page, setPageState] = useState<number>(initialPage);
  const [size, setSizeState] = useState<number>(initialSize);

  // ──────────────────────────────────────────────
  // 액터 결정: user → client → none
  // ──────────────────────────────────────────────
  const actor: ActorKey = user?.userId
    ? { type: "user", id: String(user.userId) }
    : clientId
      ? { type: "client", id: clientId }
      : { type: "none" };

  const actorKeyStr = `${actor.type}:${"id" in actor ? (actor.id ?? "") : ""}`;

  // ──────────────────────────────────────────────
  // 쿼리 키 유틸
  // ──────────────────────────────────────────────
  const keyOf = (p: number, s: number) =>
    ["comments", "page", postId, p, s, actorKeyStr, elevated] as const;
  const currentKey = keyOf(page, size);

  // ──────────────────────────────────────────────
  // 공통 유틸
  // ──────────────────────────────────────────────
  const getRoots = (pageData: CommentPageResponse): CommentDTO[] =>
    (pageData as any).content ?? (pageData as any).items ?? [];

  const cloneWithRoots = (
    pageData: CommentPageResponse,
    roots: CommentDTO[],
  ): CommentPageResponse =>
    "content" in (pageData as any)
      ? { ...(pageData as any), content: roots }
      : { ...(pageData as any), items: roots };

  const mapTree = (
    nodes: CommentDTO[],
    fn: (n: CommentDTO) => CommentDTO,
  ): CommentDTO[] =>
    nodes.map((n) =>
      n.children?.length
        ? { ...fn(n), children: mapTree(n.children, fn) }
        : fn(n),
    );

  // ──────────────────────────────────────────────
  // 쿼리 함수
  // ──────────────────────────────────────────────
  const fetchPage = useCallback(
    async (p: number, s: number) =>
      (await getCommentPage({ postId, page: p, size: s })).data!,
    [postId],
  );

  // ──────────────────────────────────────────────
  // 페이지 제어 (prefetch + refetch)
  // ──────────────────────────────────────────────
  const setPage = useCallback(
    (p: number) => {
      const nextPage = Math.max(1, p);
      setPageState(nextPage);

      const nextKey = keyOf(nextPage, size);
      qc.prefetchQuery({
        queryKey: nextKey,
        queryFn: () => fetchPage(nextPage, size),
        staleTime: 60_000,
      }).catch(() => void 0);

      qc.refetchQueries({ queryKey: nextKey, type: "active" }).catch(
        () => void 0,
      );
    },
    [qc, size, fetchPage],
  );

  const nextPage = useCallback(() => setPage(page + 1), [setPage, page]);
  const prevPage = useCallback(
    () => setPage(Math.max(1, page - 1)),
    [setPage, page],
  );

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
    [qc, fetchPage],
  );

  // ──────────────────────────────────────────────
  // 쿼리 실행
  // ──────────────────────────────────────────────
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

  /** 전역 캐시 무효화 */
  const invalidate = useCallback(
    async () => qc.invalidateQueries({ queryKey: ["comments"] }),
    [qc],
  );

  // ──────────────────────────────────────────────
  // 새 댓글 반영
  // ──────────────────────────────────────────────
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

  // ──────────────────────────────────────────────
  // 특정 댓글 DTO 교체
  // ──────────────────────────────────────────────
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
                // children이 비어온다면 기존 children/hasChildren 유지
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

      // 다른 페이지/키에 걸려있는 같은 postId 코멘트들도 최신화 유도
      await qc.invalidateQueries({
        predicate: ({ queryKey }) =>
          Array.isArray(queryKey) &&
          queryKey[0] === "comments" &&
          JSON.stringify(queryKey) !== JSON.stringify(currentKey),
      });
    },
    [qc, currentKey],
  );

  // ──────────────────────────────────────────────
  // 숨김/삭제 캐시 반영 (낙관적 전용)
  // ──────────────────────────────────────────────
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

  // ──────────────────────────────────────────────
  // 리액션 처리 로직
  // ──────────────────────────────────────────────
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

  /** 리액션 즉시 반영 (낙관적) */
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

  /** 리액션 낙관적 적용 + 서버 동기화 */
  const react = useCallback(
    async (commentId: string, next: CommentReaction) => {
      const { prev } = updateReaction(commentId, next);
      try {
        const res = await reactToComment({ commentId, value: next });
        if (!isSuccess(res)) {
          updateReaction(commentId, prev);
          toast.error(
            res?.error?.message ??
              "요청 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.",
          );
          return;
        }

        const {
          data,
          detail: { message },
          timestamp,
        } = res;

        const server = data?.myReaction ?? null;
        if (server !== next) updateReaction(commentId, server);

        if (message || timestamp) {
          toast.success(message ?? "반영되었습니다.", {
            description: timestamp
              ? formatKoreanDateTime(new Date(timestamp))
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

  // ──────────────────────────────────────────────
  // 숨김/삭제 서버 동기화 (낙관적 → 서버 → 롤백)
  // ──────────────────────────────────────────────
  const hide = useCallback(
    async (commentId: string, next: boolean) => {
      // 이전 상태 캡처 + 낙관적 반영
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
          // 롤백
          updateHidden(commentId, prevHidden);
          toast.error(res?.error?.message ?? "숨김 처리에 실패했어요.");
          return;
        }
        const {
          detail: { message },
          timestamp,
        } = res;
        if (message || timestamp) {
          toast.success(message ?? "숨김 상태가 변경되었습니다.", {
            description: timestamp
              ? formatKoreanDateTime(new Date(timestamp))
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
      const form = opts?.form;
      const needPassword = !!opts?.needPassword;
      const guestPassword = opts?.password;
      const fallbackContent = opts?.fallbackContent;

      // 1) 이전 상태 캡처 + 낙관적 반영
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
        // 2) 서버 동기화 (폼 기반 호출: 필드 에러는 deleteComment가 form에 바인딩)
        const res = await deleteComment(form ?? ({} as UseFormReturn<any>), {
          commentId,
          guestPassword,
          needPassword,
        });

        // clientFetchWithForm는 에러여도 shape를 반환.
        // 성공/실패는 isSuccess로 분기.
        if (!isSuccess(res)) {
          // 롤백
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

          // 폼이 있다면 필드 에러는 이미 표시됨. 토스트는 보조 메시지만.
          toast.error(res?.error?.message ?? "삭제에 실패했습니다.");
          return;
        }

        // 3) 성공 토스트
        const {
          detail: { message },
          timestamp,
        } = res;
        if (message || timestamp) {
          toast.success(message ?? "삭제되었습니다.", {
            description: timestamp
              ? formatKoreanDateTime(new Date(timestamp))
              : undefined,
          });
        }

        // 4) 다른 페이지/키 invalidate (현재 키는 낙관적 업데이트로 최신)
        await qc.invalidateQueries({
          predicate: ({ queryKey }) =>
            Array.isArray(queryKey) &&
            queryKey[0] === "comments" &&
            JSON.stringify(queryKey) !== JSON.stringify(currentKey),
        });
      } catch (e: any) {
        // 예외 롤백
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

  // ──────────────────────────────────────────────
  // 컨텍스트 값 생성
  // ──────────────────────────────────────────────
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

/** CommentContext 훅 — Provider 내부에서만 사용 가능 */
export const useCommentContext = () => {
  const ctx = useContext(CommentContext);
  if (!ctx)
    throw new Error("useCommentContext must be used within a CommentProvider");
  return ctx;
};
