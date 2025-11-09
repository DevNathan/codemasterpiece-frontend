"use client";
import { Button } from "@/shared/components/shadcn/button";

export default function SubmitBar({ submitting }: { submitting?: boolean }) {
  return (
    <div className="flex justify-end">
      <Button
        type="submit"
        disabled={submitting}
        className="bg-point text-white hover:bg-point/90 shadow-sm hover:shadow active:scale-[0.98] transition-all"
      >
        작성
      </Button>
    </div>
  );
}
