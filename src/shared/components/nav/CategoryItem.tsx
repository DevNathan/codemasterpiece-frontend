"use client";

import React from "react";
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/shadcn/sidebar";
import { CategoryDTO } from "@/features/category/types/CategoryDTO";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/shadcn/collapsible";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  FileText,
  Folder as FolderIcon,
  Link2,
} from "lucide-react";
import { useAuth } from "@/contexts/UserContext";
import DragHandle from "@/features/category/dnd/DragHandle";
import { useSortableCategory } from "@/features/category/dnd/useSortableCategory";
import CategoryDropdown from "@/shared/components/nav/CategoryDropdown";

type Props = {
  category: CategoryDTO;
  /** DndTree가 주입하는 'SidebarMenuSub' 래퍼 내부의 children */
  childrenSlot?: React.ReactNode;
};

const CategoryItem = ({ category, childrenSlot }: Props) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const canEdit = user?.role === "AUTHOR";
  const { attributes, listeners, setNodeRef, style } = useSortableCategory(
    category.categoryId,
  );

  if (category.type === "FOLDER") {
    const count = category.children?.length ?? 0;

    return (
      <Collapsible>
        <SidebarMenuItem ref={setNodeRef} style={style} className="group">
          <div className="flex items-center gap-2">
            {canEdit && (
              <DragHandle
                attributes={attributes}
                listeners={listeners}
                visible
              />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="collapsible-trigger flex-1 px-2 py-1.5 rounded-md hover:bg-muted/60 transition data-[state=open]:bg-muted/70">
                    <div className="flex items-center gap-2 min-w-0">
                      <ChevronRight className="chevron-rotate h-4 w-4 shrink-0 transition-transform" />
                      <FolderIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <p
                        className="flex-1 min-w-0 truncate font-medium"
                        title={category.name}
                      >
                        {category.name}
                      </p>
                    </div>
                    <div className="ml-2 flex items-center gap-2">
                      {count > 0 && (
                        <span className="inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">
                          {count}
                        </span>
                      )}
                    </div>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </div>
            </div>
            {canEdit && (
              <CategoryDropdown
                categoryId={category.categoryId}
                categoryType={category.type}
                category={category}
              />
            )}
          </div>

          <CollapsibleContent>
            <div className="relative pl-2">{childrenSlot}</div>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  const isActive =
    category.link && pathname?.startsWith(`/posts/${category.link}`);

  return (
    <SidebarMenuItem
      ref={setNodeRef}
      style={style}
      className="group flex items-center"
    >
      {canEdit && (
        <DragHandle attributes={attributes} listeners={listeners} visible />
      )}
      <Link
        href={`/posts/${category.link ?? ""}`}
        className={`flex items-center justify-between gap-2 w-full px-2 py-1.5 rounded-md
          ${isActive ? "bg-muted/70 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}
          transition`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {category.imagePath ? (
            <Image
              src={category.imagePath}
              alt={category.name}
              width={18}
              height={18}
              className="rounded-sm shrink-0"
            />
          ) : (
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate">{category.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link2 className="h-3.5 w-3.5 text-muted-foreground/70" />
        </div>
      </Link>
      {canEdit && (
        <CategoryDropdown
          categoryId={category.categoryId}
          categoryType={category.type}
          category={category}
        />
      )}
    </SidebarMenuItem>
  );
};

export default CategoryItem;
