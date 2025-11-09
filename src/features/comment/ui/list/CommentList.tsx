"use client";

import React, { useCallback } from "react";
import { useCommentContext } from "@/features/comment/context/CommentContext";
import PageSelector from "@/shared/components/pagination/PageSelector";
import ControlsBar from "@/features/comment/ui/list/parts/ControlsBar";
import SizeSelector from "@/features/comment/ui/list/parts/SizeSelector";
import FetchingBadge from "@/features/comment/ui/list/parts/FetchingBadge";
import StateSwitch from "@/features/comment/ui/list/parts/StateSwitch";
import RootList from "@/features/comment/ui/list/parts/RootList";
import SkeletonList from "@/features/comment/ui/shared/SkeletonList";
import ErrorState from "@/features/comment/ui/list/parts/ErrorState";
import EmptyState from "@/features/comment/ui/list/parts/EmptyState";

const CommentList = () => {
  const {
    setPage,
    size,
    setSize,
    query: { data, isLoading, isFetching, error, refetch },
  } = useCommentContext();

  const roots = data?.content ?? [];
  const isInitialLoading = isLoading || (isFetching && !data);

  const handleChangeSize = useCallback(
    (v: number | string) => {
      const n = Math.max(1, parseInt(String(v), 10) || 5);
      setSize(n); // 훅 내부에서 LocalStorage까지 같이 처리함
    },
    [setSize],
  );

  return (
    <div className="px-3 py-2 my-10 space-y-6">
      {/* 상단 컨트롤바 */}
      <ControlsBar
        left={<SizeSelector value={size} onChange={handleChangeSize} />}
        right={isFetching && data ? <FetchingBadge /> : null}
      />

      {/* 본문 상태 스위치 */}
      <StateSwitch
        loading={isInitialLoading}
        error={error}
        empty={!roots || roots.length === 0}
        loadingView={<SkeletonList count={5} depth={0} />}
        errorView={
          <ErrorState
            title="댓글을 불러오는 중 문제가 발생했어요"
            desc="네트워크 상태를 확인하고 다시 시도해 주세요."
            onRetry={() => refetch()}
            className="mx-1"
          />
        }
        emptyView={
          <EmptyState
            title="아직 댓글이 없습니다"
            desc="첫 번째 댓글을 남겨보세요."
            className="mx-1"
          />
        }
      >
        {() => (
          <div className="rounded-2xl border bg-card/70 backdrop-blur p-3 sm:p-4">
            <div className="h-1 w-full bg-gradient-to-r from-point/20 via-point/60 to-point/20 rounded-md mb-4" />
            <RootList items={roots} />
            <PageSelector
              pagination={data!.pagination}
              action={setPage}
              shouldBePushed={false}
            />
          </div>
        )}
      </StateSwitch>
    </div>
  );
};

export default CommentList;
