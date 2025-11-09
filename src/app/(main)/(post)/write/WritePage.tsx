import React from "react";
import { getQueryClient } from "@/lib/getQueryClient";
import { categoryKeys } from "@/features/category/queries/keys";
import getCategoryTreeServer from "@/features/category/api/getCategoryTreeServer";
import { HydrationBoundary } from "@tanstack/react-query";
import { dehydrate } from "@tanstack/query-core";
import WriterShell from "@/features/post/ui/write/WriterShell";

const WritePage = async () => {
  return <WriterShell />;
};

export default WritePage;
