import clsx from "clsx";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

const MessageBubbleSkeleton = ({ align }: { align: "left" | "right" }) => {
  const isRight = align === "right";

  return (
    <div
      className={clsx(
        "flex w-full mb-4",
        isRight ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={clsx(
          "flex items-start gap-3 max-w-[75%]",
          isRight && "flex-row-reverse",
        )}
      >
        {/* 프로필 이미지 */}
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />

        {/* 말풍선 */}
        <div
          className={clsx(
            "bg-muted/40 border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-2 w-full",
          )}
        >
          <Skeleton className="w-24 h-4 rounded-md" />
          <Skeleton className="w-full h-5 rounded-md" />
          <Skeleton className="w-3/4 h-5 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default MessageBubbleSkeleton;
