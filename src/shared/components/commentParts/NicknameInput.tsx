"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/shadcn/form";
import { Input } from "@/shared/components/shadcn/input";

export default function NicknameInput({ control }: { control: any }) {
  return (
    <FormField
      control={control}
      name="guestDisplayName"
      render={({ field }) => (
        <FormItem className="max-w-[200px]">
          <FormLabel className="text-xs">닉네임</FormLabel>
          <FormControl>
            <Input
              placeholder="닉네임"
              maxLength={10}
              {...field}
              className="focus-visible:ring-point"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
