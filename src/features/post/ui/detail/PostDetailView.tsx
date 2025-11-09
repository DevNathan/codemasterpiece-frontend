"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePost } from "@/features/post/hook/usePost";
import { postKeys, type ActorKey } from "@/features/post/queries/keys";
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
import { Edit2, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/UserContext";
import { toast } from "sonner";
import deletePost from "@/features/post/api/deletePost";
import DeletePostButton from "@/features/post/ui/detail/element/DeletePostButton";

type Props = { slug: string; actor: ActorKey };

export default function PostDetailView({ slug, actor }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { data, isFetching } = usePost({ slug, actor });
  const { isAuthor } = useAuth();
  useEffect(() => setMounted(true), []);

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
  useViewOnVisible(actionRef, {
    postId: data?.postId ?? "",
    queryKey,
    threshold: 0.25,
    resync: "none",
  });

  // 삭제 다이얼로그
  const [openDel, setOpenDel] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
  }, [data?.postId, router]);

  if (!mounted || isFetching || !data) return <Loading />;

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
    mainContent,
    updatedAt,
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

      <div className="max-w-[1200px] w-full mx-auto">
        <div className="relative">
          <Content isPublished={published} mainContent={mainContent} />
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
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={openDel} onOpenChange={setOpenDel}>
        <DialogContent className="sm:max-w-[420px]">
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
