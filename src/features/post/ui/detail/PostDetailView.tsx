"use client";

import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePost } from "@/features/post/hook/usePost";
import { type ActorKey, postKeys } from "@/features/post/queries/keys";
import { useToggleLike } from "@/features/post/hook/useToggleLike";
import { useViewOnVisible } from "@/features/post/hook/useViewOnVisible";
import FrontPage from "@/features/post/ui/detail/element/FrontPage";
import Loading from "@/app/(main)/loading";
import Content from "@/features/post/ui/detail/element/Content";
import AuthorBox from "@/features/post/ui/detail/element/AuthorBox";
import LikeAndShare from "@/features/post/ui/detail/element/LikeAndShare";
import CommentSection from "@/features/comment/ui/CommentSection";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/shadcn/tooltip";
import { Button } from "@/shared/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/shadcn/dialog";
import { Edit2 } from "lucide-react";
import { useAuth } from "@/contexts/UserContext";
import { toast } from "sonner";
import deletePost from "@/features/post/api/deletePost";
import DeletePostButton from "@/features/post/ui/detail/element/DeletePostButton";
import MoreContentSection from "@/features/post/ui/detail/element/MoreContentSection";
import { PostTocDTO } from "@/features/post/type/PostDetailDTO";

type Props = {
  slug: string;
  parsedHtml: string | null;
  toc: PostTocDTO[];
  actor: ActorKey;
};

/**
 * @component PostDetailView
 * @description 게시글 상세 정보를 표시하는 메인 컨테이너 뷰입니다.
 * React Compiler 최적화를 위해 동기적 상태 업데이트를 제거하고 하이드레이션 무결성을 확보했습니다.
 */
export default function PostDetailView({
  slug,
  parsedHtml,
  toc,
  actor,
}: Props) {
  const router = useRouter();

  /**
   * 클라이언트 환경 여부를 확인하기 위한 외부 스토어 동기화 훅입니다.
   * useEffect 내부의 동기적인 setState 호출(Cascading Render)을 방지하고 하이드레이션 무결성을 확보합니다.
   */
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const { data, isFetching } = usePost({ slug, actor });
  const { isAuthor } = useAuth();

  const queryKey = useMemo(
    () => postKeys.detail({ slug, actor }),
    [slug, actor],
  );

  const liked = data?.liked ?? false;
  const likeCount = data?.likeCount ?? 0;

  const { onClick: handleLikeClick, isPending } = useToggleLike({
    postId: data?.postId,
    isLiked: liked,
    queryKey,
    resync: "none",
  });

  const actionRef = useRef<Element | null>(null);
  const enabledViewObserver = isClient && !!data?.postId;

  useViewOnVisible(actionRef, {
    postId: data?.postId ?? "",
    queryKey,
    threshold: 0.25,
    resync: "none",
    enabled: enabledViewObserver,
  });

  // 삭제 다이얼로그
  const [openDel, setOpenDel] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /**
   * 게시글 삭제 동작을 처리하는 함수입니다.
   * React Compiler의 의존성 추론 방식에 맞추어 data 객체 전체를 의존성 배열에 주입합니다.
   */
  const handleDelete = useCallback(async () => {
    if (!data?.postId) return;
    try {
      setDeleting(true);
      const res = await deletePost(data.postId);
      if ((res as any)?.ok === false) {
        toast.error((res as any)?.error?.message ?? "삭제에 실패했습니다.");
        setDeleting(false);
        return;
      }
      toast.success("삭제되었습니다.");
      setOpenDel(false);
      router.push("/");
    } catch (e: any) {
      toast.error(e?.message ?? "네트워크 오류가 발생했습니다.");
      setDeleting(false);
    }
  }, [data, router]);

  if (!isClient || isFetching || !data) return <Loading />;

  const {
    postId,
    title,
    headImage,
    headContent,
    viewCount,
    commentCount,
    published,
    createdAt,
    categoryName,
    categoryLink,
    tags,
    updatedAt,
    morePosts,
  } = data;

  return (
    <div>
      <FrontPage
        headImage={headImage}
        title={title}
        headContent={headContent}
        viewCount={viewCount}
        likeCount={likeCount}
        commentCount={commentCount}
        isPublished={published}
        createdAt={createdAt}
        updatedAt={updatedAt}
        tags={tags}
        categoryName={categoryName}
        categoryLink={categoryLink}
      />

      <div className="max-w-300 w-full mx-auto">
        <div className="relative">
          <Content isPublished={published} parsedHtml={parsedHtml} toc={toc} />

          <AuthorBox className="m-4" />

          <LikeAndShare
            ref={actionRef as React.RefObject<HTMLElement>}
            likeCount={likeCount}
            isLiked={liked}
            handleLikeClick={handleLikeClick}
            isPending={isPending}
          />

          {isAuthor && (
            <div className="mt-6 flex justify-end gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="outline" asChild>
                    <Link href={`/write/${postId}`}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      수정
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">이 글 수정</TooltipContent>
              </Tooltip>

              <DeletePostButton
                postId={postId}
                title={title}
                onDeleted={() => router.push("/posts")}
              />
            </div>
          )}

          <CommentSection postId={postId} />
        </div>

        {morePosts.length > 0 && <MoreContentSection morePosts={morePosts} />}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={openDel} onOpenChange={setOpenDel}>
        <DialogContent className="sm:max-w-105">
          <DialogHeader>
            <DialogTitle>정말 삭제하시겠습니까?</DialogTitle>
            <DialogDescription>
              이 작업은 되돌릴 수 없습니다. <strong>{title}</strong> 게시글을
              영구적으로 삭제합니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpenDel(false)}
              disabled={deleting}
            >
              취소
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "삭제 중…" : "영구 삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
