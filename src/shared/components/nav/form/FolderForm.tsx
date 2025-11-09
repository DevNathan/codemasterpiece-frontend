import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FolderSchema,
  folderSchema,
} from "@/features/category/schemas/folderSchema";
import createCategory from "@/features/category/api/createCategory";
import { isSuccess } from "@/lib/api/clientFetch";
import { toast } from "sonner";
import { formatKoreanDateTime } from "@/lib/util/timeFormatter";
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/shadcn/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/shadcn/form";
import { Input } from "@/shared/components/shadcn/input";
import { Button } from "@/shared/components/shadcn/button";
import useCategoryTree from "@/features/category/hooks/useCategoryTree";

type Props = {
  parentId?: string;
};

const FolderForm = ({ parentId }: Props) => {
  const { invalidate } = useCategoryTree();
  const closeRef = useRef<HTMLButtonElement>(null);

  const form = useForm({
    mode: "onChange",
    resolver: zodResolver(folderSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: FolderSchema) => {
    const res = await createCategory(form, {
      ...data,
      type: "FOLDER",
      parentId,
    });

    if (!isSuccess(res)) {
      const {
        error: { message },
        timestamp,
      } = res;
      return toast.error(message, {
        description: formatKoreanDateTime(new Date(timestamp)),
      });
    }
    const {
      detail: { message },
      timestamp,
    } = res;

    invalidate();

    toast.success(message, {
      description: formatKoreanDateTime(new Date(timestamp)),
    });

    closeRef.current?.click();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>폴더 추가</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 mt-6 px-1 sm:px-0"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">
                  폴더 이름
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-12 text-base rounded-md"
                    placeholder="폴더명을 입력하세요"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter className="pt-4 flex-col sm:flex-row gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                ref={closeRef}
                className="w-full sm:w-auto"
              >
                취소
              </Button>
            </DialogClose>
            <Button type="submit" className="w-full sm:w-auto">
              추가하기
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};

export default FolderForm;
