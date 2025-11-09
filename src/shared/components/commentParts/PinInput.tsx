"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/shadcn/form";
import { Input } from "@/shared/components/shadcn/input";

export default function PinInput({ control }: { control: any }) {
  return (
    <FormField
      control={control}
      name="guestPin"
      render={({ field }) => (
        <FormItem className="max-w-[200px]">
          <FormLabel className="text-xs">비밀번호(6자리)</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder="6자리 숫자"
              {...field}
              inputMode="numeric"
              pattern="\d*"
              maxLength={6}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                field.onChange(v);
              }}
              className="tracking-widest focus-visible:ring-point"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
