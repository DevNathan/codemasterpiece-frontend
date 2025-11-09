"use client";

import React from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/components/shadcn/sidebar";
import PointChanger from "@/shared/components/nav/PointChanger";
import ThemeChanger from "@/shared/components/nav/ThemeChanger";
import CategoryDropdown from "@/shared/components/nav/CategoryDropdown";
import useCategoryTree from "@/features/category/hooks/useCategoryTree";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import CategoryItem from "@/shared/components/nav/CategoryItem";
import { useAuth } from "@/contexts/UserContext";
import dynamic from "next/dynamic";

const CategoryDndTree = dynamic(
  () => import("@/features/category/dnd/CategoryDndTree"),
  { ssr: false, loading: () => <Skeleton className="h-6 w-full rounded-md" /> },
);

const NavSection = () => {
  const { isMobile } = useSidebar();
  const { categoryTree, isFetching } = useCategoryTree();
  const { user } = useAuth();
  const canEdit = user?.role === "AUTHOR";

  return (
    <Sidebar
      collapsible="offcanvas"
      variant="inset"
      className="select-none p-0"
    >
      {isMobile || (
        <div className="h-14 bg-background/80 transition-colors duration-500" />
      )}

      <SidebarHeader className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors duration-500 p-3 border-b">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold tracking-wide text-foreground/90">
            목록
          </span>
          <CategoryDropdown />
        </div>
      </SidebarHeader>

      <SidebarMenu className="flex-1 overflow-y-auto p-2">
        {isFetching ? (
          <div className="space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <SidebarMenuItem key={i} className="px-1">
                <Skeleton className="h-6 w-full rounded-md" />
              </SidebarMenuItem>
            ))}
          </div>
        ) : (
          <CategoryDndTree
            data={categoryTree ?? []}
            canEdit={canEdit}
            renderRowAction={(c, childrenSlot) => (
              <CategoryItem category={c} childrenSlot={childrenSlot} />
            )}
          />
        )}
      </SidebarMenu>

      <div className="flex justify-end items-center p-3 gap-3 border-t">
        <PointChanger />
        <ThemeChanger />
      </div>
    </Sidebar>
  );
};

export default NavSection;
