"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryKeys } from "@/features/category/queries/keys";
import getCategoryTree from "@/features/category/api/getCategoryTree";
import { CategoryDTO } from "@/features/category/types/CategoryDTO";

export default function useCategoryTree() {
  const qc = useQueryClient();

  const {
    data: categoryTree,
    isFetching,
    error,
    refetch,
  } = useQuery<CategoryDTO[]>({
    queryKey: categoryKeys.tree(),
    queryFn: async () => {
      const res = await getCategoryTree();
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const invalidate = () =>
    void qc.invalidateQueries({ queryKey: categoryKeys.tree() });

  return {
    categoryTree,
    isFetching,
    error,
    refetch,
    invalidate,
  };
}
