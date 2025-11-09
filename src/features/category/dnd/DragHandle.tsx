"use client";
import React from "react";
import { GripVertical } from "lucide-react";
import { DraggableAttributes } from "@dnd-kit/core";

type Props = {
  listeners?: any;
  attributes?: DraggableAttributes;
  visible?: boolean;
};
export default function DragHandle({ listeners, attributes, visible }: Props) {
  return (
    <button
      {...listeners}
      {...attributes}
      className={`mr-1 inline-flex h-5 w-5 items-center justify-center rounded hover:bg-muted/70 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-label="Drag handle"
      onClick={(e) => e.preventDefault()}
    >
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
    </button>
  );
}
