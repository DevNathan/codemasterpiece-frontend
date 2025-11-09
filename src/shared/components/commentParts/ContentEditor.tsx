"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/shadcn/form";
import { Textarea } from "@/shared/components/shadcn/textarea";
import { cn } from "@/lib/utils";

export default function ContentEditor({
  control,
  isValid,
  onSubmitEnter,
}: {
  control: any;
  isValid: boolean;
  onSubmitEnter: () => void;
}) {
  return (
    <FormField
      control={control}
      name="content"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel className="text-sm font-medium">댓글 내용</FormLabel>
            <span className="text-[11px] text-muted-foreground">
              Enter=제출, Shift+Enter=줄바꿈
            </span>
          </div>
          <FormControl>
            <Textarea
              {...field}
              maxLength={2000}
              placeholder="자유롭게 댓글을 작성해주세요!"
              className={cn(
                "min-h-[120px] resize-none",
                "border border-border bg-background/70",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-point focus-visible:border-point",
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (isValid) onSubmitEnter();
                }
              }}
            />
          </FormControl>
          <div className="mt-2 flex items-center justify-between">
            <FormMessage />
            <span className="text-xs text-muted-foreground">
              {field.value?.length ?? 0}/2000
            </span>
          </div>
        </FormItem>
      )}
    />
  );
}
