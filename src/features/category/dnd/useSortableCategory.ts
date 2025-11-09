"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function useSortableCategory(id: string) {
  const s = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(s.transform),
    transition: s.transition,
  };
  return {
    attributes: s.attributes,
    listeners: s.listeners,
    setNodeRef: s.setNodeRef,
    isDragging: s.isDragging,
    over: s.over,
    style,
  };
}
