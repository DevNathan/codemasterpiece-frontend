"use client";

import React, { useMemo, useState } from "react";
import {
  type CollisionDetection,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import {
  moveCategory,
  type MoveCategoryPayload,
} from "@/features/category/api/moveCategory";
import type { CategoryDTO } from "@/features/category/types/CategoryDTO";
import { SidebarMenuSub } from "@/shared/components/shadcn/sidebar";

function cloneTree<T>(arr: T[]): T[] {
  return JSON.parse(JSON.stringify(arr));
}
function findNodePath(
  tree: CategoryDTO[],
  id: string,
  path: string[] = [],
): string[] | null {
  for (const n of tree) {
    if (n.categoryId === id) return [...path, n.categoryId];
    if (n.children?.length) {
      const p = findNodePath(n.children, id, [...path, n.categoryId]);
      if (p) return p;
    }
  }
  return null;
}
function getByPath(tree: CategoryDTO[], path: string[]): CategoryDTO {
  let cur: any = { children: tree };
  for (const id of path) {
    cur = (cur.children as CategoryDTO[]).find((c) => c.categoryId === id)!;
  }
  return cur;
}
function removeAtParent(tree: CategoryDTO[], id: string) {
  const path = findNodePath(tree, id);
  if (!path) return null;
  const selfId = path.at(-1)!;
  const parentId = path.length > 1 ? path.at(-2)! : null;
  const parent = parentId
    ? getByPath(tree, path.slice(0, -1))
    : ({ children: tree } as any);
  const list: CategoryDTO[] = parentId
    ? (parent.children ?? [])
    : (tree as CategoryDTO[]);
  const idx = list.findIndex((x) => x.categoryId === selfId);
  const [removed] = list.splice(idx, 1);
  return { removed, parentId, index: idx };
}
function insertInto(
  tree: CategoryDTO[],
  parentId: string | null,
  index: number,
  node: CategoryDTO,
) {
  if (parentId === null) {
    (tree as CategoryDTO[]).splice(index, 0, node);
    node.level = 0;
    return;
  }
  const parentPath = findNodePath(tree, parentId);
  if (!parentPath) return;
  const parent = getByPath(tree, parentPath);
  parent.children = parent.children ?? [];
  parent.children.splice(index, 0, node);
  node.level = (parent.level ?? 0) + 1;
}
function buildIdMeta(tree: CategoryDTO[]) {
  const map = new Map<string, { parentId: string | null; index: number }>();
  const walk = (list: CategoryDTO[], parentId: string | null) => {
    list.forEach((n, i) => {
      map.set(n.categoryId, { parentId, index: i });
      if (n.children?.length) walk(n.children, n.categoryId);
    });
  };
  walk(tree, null);
  return map;
}
const collision: CollisionDetection = (args) => {
  const viaPointer = pointerWithin(args);
  return viaPointer.length ? viaPointer : rectIntersection(args);
};

// ---- `<ul>` droppable 래퍼 (div 아님!) ----
function FolderSubList({
  parentId,
  items,
  children,
}: {
  parentId: string;
  items: string[];
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `container:${parentId}` });
  return (
    <SidebarMenuSub
      ref={setNodeRef}
      className={
        isOver ? "outline-1 outline-primary/60 rounded-md" : "mr-0 pr-0"
      }
    >
      <SortableContext items={items}>{children}</SortableContext>
    </SidebarMenuSub>
  );
}

export default function CategoryDndTree({
  data,
  canEdit,
  renderRowAction,
  onLocalChangeAction,
}: {
  data: CategoryDTO[];
  canEdit: boolean;
  renderRowAction: (
    c: CategoryDTO,
    childrenSlot?: React.ReactNode,
  ) => React.ReactNode;
  onLocalChangeAction?: (next: CategoryDTO[]) => void;
}) {
  const [tree, setTree] = useState<CategoryDTO[]>(() => cloneTree(data));
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );
  const idMeta = useMemo(() => buildIdMeta(tree), [tree]);

  function renderNode(n: CategoryDTO): React.ReactNode {
    const childIds = (n.children ?? []).map((c) => c.categoryId);
    const childrenSlot =
      n.type === "FOLDER" ? (
        <FolderSubList parentId={n.categoryId} items={childIds}>
          {(n.children ?? []).map((child) => (
            <React.Fragment key={child.categoryId}>
              {renderNode(child)}
            </React.Fragment>
          ))}
        </FolderSubList>
      ) : null;

    return (
      <React.Fragment key={n.categoryId}>
        {renderRowAction(n, childrenSlot)}
      </React.Fragment>
    );
  }

  function parentListLength(pid: string | null) {
    if (pid === null) return tree.length;
    const pPath = findNodePath(tree, pid);
    if (!pPath) return 0;
    const parent = getByPath(tree, pPath);
    return parent.children?.length ?? 0;
  }

  async function onDragEnd(e: DragEndEvent) {
    if (!canEdit) return;

    const curId = e.active?.id ? String(e.active.id) : null;
    const overId = e.over?.id ? String(e.over.id) : null;
    if (!curId || !overId || curId === overId) return;

    const dropOnContainer = overId.startsWith("container:");
    const targetParentId = dropOnContainer
      ? overId.replace("container:", "")
      : (idMeta.get(overId)?.parentId ?? null);

    let newIndex: number | null = null;
    let beforeId: string | null = null;
    let afterId: string | null = null;

    if (dropOnContainer) {
      newIndex = parentListLength(targetParentId);
    } else {
      const dst = idMeta.get(overId!);
      if (!dst) return;
      newIndex = dst.index;
      beforeId = overId!;
      // afterId는 필요시 계산해서 추가
    }

    // optimistic update
    setTree((prev) => {
      const next = cloneTree(prev);
      const cut = removeAtParent(next, curId);
      if (!cut) return prev;
      insertInto(next, targetParentId || null, newIndex!, cut.removed);
      onLocalChangeAction?.(next);
      return next;
    });

    // server patch
    const payload: MoveCategoryPayload = {
      categoryId: curId,
      newParentId: targetParentId || null,
      newIndex,
      beforeId,
      afterId,
    };

    await moveCategory(payload);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collision}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={tree.map((n) => n.categoryId)}>
        {tree.map((n) => renderNode(n))}
      </SortableContext>
    </DndContext>
  );
}
