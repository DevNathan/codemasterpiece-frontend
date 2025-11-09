"use client";

import React, { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/shadcn/form";
import { Button } from "@/shared/components/shadcn/button";
import { Badge } from "@/shared/components/shadcn/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/shadcn/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/shadcn/command";
import { ScrollArea } from "@/shared/components/shadcn/scroll-area";
import { Separator } from "@/shared/components/shadcn/separator";
import { Kbd } from "@/shared/components/shadcn/kbd";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Image as ImageIcon,
  Link2,
  X,
} from "lucide-react";
import useCategoryTree from "@/features/category/hooks/useCategoryTree";
import { CategoryDTO } from "@/features/category/types/CategoryDTO";

// ==== 메인: 폼 필드
const FormFieldCategory = () => {
  const { setValue, watch } = useFormContext();
  const currentId: string = watch("categoryId");
  const { categoryTree = [] } = useCategoryTree();

  // id -> node 맵 + 경로 빌드
  const { idMap, pathMap, allLinks } = useMemo(() => {
    const idMap = new Map<string, CategoryDTO>();
    const pathMap = new Map<string, string[]>();
    const links: Array<{ id: string; label: string; path: string[] }> = [];

    const walk = (nodes: CategoryDTO[], path: string[]) => {
      for (const n of nodes) {
        idMap.set(n.categoryId, n);
        const p = [...path, n.name];
        pathMap.set(n.categoryId, p);
        if (n.type === "LINK") {
          links.push({ id: n.categoryId, label: n.name, path: p });
        }
        if (n.children?.length) walk(n.children, p);
      }
    };
    walk(categoryTree, []);
    return { idMap, pathMap, allLinks: links };
  }, [categoryTree]);

  const selectedPath = currentId ? (pathMap.get(currentId) ?? []) : [];
  const selectedLabel = selectedPath.length
    ? selectedPath.join(" / ")
    : "카테고리 선택";

  return (
    <FormItem>
      <FormLabel>카테고리</FormLabel>
      <FormControl>
        <CategoryPickerTrigger
          label={selectedLabel}
          hasSelected={!!currentId}
          onClear={() =>
            setValue("categoryId", "", {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        >
          <CategoryTreePopoverContent
            tree={categoryTree}
            idMap={idMap}
            allLinks={allLinks}
            onPick={(id) => {
              setValue("categoryId", id, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          />
        </CategoryPickerTrigger>
      </FormControl>
      <div className="mt-2 flex items-center justify-between">
        {currentId && (
          <Badge variant="secondary" className="max-w-[220px] truncate">
            {selectedPath[selectedPath.length - 1]}
          </Badge>
        )}
      </div>
      <FormMessage />
    </FormItem>
  );
};

export default FormFieldCategory;

// ==== 트리 트리거 (버튼 + 팝오버 래퍼)
// ==== 트리 트리거 (버튼 + 팝오버 래퍼) — 오버플로우 고정 버전
function CategoryPickerTrigger({
  label,
  hasSelected,
  onClear,
  children,
}: React.PropsWithChildren<{
  label: string;
  hasSelected: boolean;
  onClear: () => void;
}>) {
  const [open, setOpen] = useState(false);

  type WithOnClose = { onClose?: () => void };
  const childEl = children as React.ReactElement<WithOnClose> | undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* 핵심: grid로 분리 + min-w-0 로 텍스트 수축 허용 */}
      <div className="grid w-full grid-cols-[1fr_auto] items-center gap-2">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="min-w-0 w-full justify-between"
          >
            <span
              className={cn(
                "truncate",
                !hasSelected && "text-muted-foreground",
              )}
            >
              {label}
            </span>
            <FolderOpen className="shrink-0 size-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>

        {hasSelected && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClear}
            aria-label="선택 해제"
            className="justify-self-end"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      <PopoverContent className="w-[640px] p-0" align="start" sideOffset={8}>
        {childEl && React.isValidElement(childEl)
          ? React.cloneElement(childEl, { onClose: () => setOpen(false) })
          : children}
      </PopoverContent>
    </Popover>
  );
}

// ==== 팝오버 컨텐츠 (검색 + 트리)
function CategoryTreePopoverContent({
  tree,
  idMap,
  allLinks,
  onPick,
  onClose,
}: {
  tree: CategoryDTO[];
  idMap: Map<string, CategoryDTO>;
  allLinks: Array<{ id: string; label: string; path: string[] }>;
  onPick: (id: string) => void;
  onClose?: () => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    // 루트 폴더 기본 오픈
    const s = new Set<string>();
    tree.forEach((n) => n.type === "FOLDER" && s.add(n.categoryId));
    return s;
  });

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePick = (id: string) => {
    const node = idMap.get(id);
    if (!node || node.type !== "LINK") return;
    onPick(id);
    onClose?.();
  };

  return (
    <Command shouldFilter>
      <div className="px-2 pt-2">
        <CommandInput placeholder="카테고리 검색 (링크만)" />
      </div>
      <CommandEmpty className="px-3 py-6 text-sm text-muted-foreground">
        검색 결과가 없습니다.
      </CommandEmpty>

      {/* 검색 리스트: 링크만 빠르게 선택 */}
      <CommandList>
        <CommandGroup heading="빠른 선택 (LINK)">
          <ScrollArea className="max-h-56">
            {allLinks.map((l) => (
              <CommandItem
                key={l.id}
                value={`${l.label} ${l.path.join(" / ")}`}
                onSelect={() => handlePick(l.id)}
                className="flex items-center gap-2"
              >
                <Link2 className="size-4 text-muted-foreground" />
                <div className="truncate">
                  <span className="font-medium">{l.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    / {l.path.slice(0, -1).join(" / ")}
                  </span>
                </div>
              </CommandItem>
            ))}
          </ScrollArea>
        </CommandGroup>
      </CommandList>

      <Separator />

      {/* 트리 탐색 */}
      <div className="px-2 py-2">
        <div role="tree" aria-label="카테고리 트리" className="max-h-72 pr-1">
          <Tree
            nodes={tree}
            expanded={expanded}
            onToggle={toggle}
            onPickLink={handlePick}
          />
        </div>
      </div>

      <Separator />

      {/* 힌트 */}
      <div className="flex items-center justify-between px-3 py-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>폴더는 열기만, 링크만 선택</span>
        </div>
        <div className="flex items-center gap-1">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          <span className="mx-1">•</span>
          <Kbd>Enter</Kbd>
        </div>
      </div>
    </Command>
  );
}

// ==== 트리 렌더러 (재귀)
function Tree({
  nodes,
  expanded,
  onToggle,
  onPickLink,
  depth = 0,
}: {
  nodes: CategoryDTO[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onPickLink: (id: string) => void;
  depth?: number;
}) {
  if (!nodes?.length) {
    return (
      <div className="px-2 py-1 text-xs text-muted-foreground">
        하위 항목 없음
      </div>
    );
  }
  return (
    <ul className={cn("space-y-0.5", depth === 0 && "mt-1")}>
      {nodes
        .slice()
        .sort(
          (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
        )
        .map((n) => {
          const isFolder = n.type === "FOLDER";
          const isOpen = expanded.has(n.categoryId);
          return (
            <li key={n.categoryId}>
              <div
                className={cn(
                  "flex items-center rounded-sm px-2 py-1 text-sm select-none",
                  isFolder
                    ? "cursor-pointer hover:bg-muted"
                    : "cursor-pointer hover:bg-primary/10",
                )}
                role="treeitem"
                aria-expanded={isFolder ? isOpen : undefined}
                onClick={() =>
                  isFolder ? onToggle(n.categoryId) : onPickLink(n.categoryId)
                }
              >
                {/* 인디케이터/아이콘 */}
                <div className="w-4 mr-1.5 flex items-center justify-center">
                  {isFolder ? (
                    isOpen ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )
                  ) : null}
                </div>
                {isFolder ? (
                  <Folder className="mr-2 size-4 text-muted-foreground" />
                ) : (
                  <Link2 className="mr-2 size-4 text-muted-foreground" />
                )}

                {/* 이름 + 썸네일(옵션) */}
                <span className="truncate">{n.name}</span>
                {n.imagePath && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <ImageIcon className="size-3.5" />
                    이미지
                  </span>
                )}
              </div>

              {/* children */}
              {isFolder && isOpen && n.children?.length ? (
                <div className="ml-6">
                  <Tree
                    nodes={n.children}
                    expanded={expanded}
                    onToggle={onToggle}
                    onPickLink={onPickLink}
                    depth={depth + 1}
                  />
                </div>
              ) : null}
            </li>
          );
        })}
    </ul>
  );
}
