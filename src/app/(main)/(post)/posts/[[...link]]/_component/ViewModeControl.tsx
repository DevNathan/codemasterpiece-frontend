import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/shadcn/tooltip";
import { Button } from "@/shared/components/shadcn/button";
import { cn } from "@/lib/utils";
import ToGridIcon from "@/shared/assets/icon/ToGridIcon";
import ToListIcon from "@/shared/assets/icon/ToListIcon";

type Props = {
  viewMode: "grid" | "compact";
  onChangeViewMode: (mode: "grid" | "compact") => void;
};

const ViewModeControl = ({ viewMode, onChangeViewMode }: Props) => {
  return (
    <div className="flex items-center gap-2 md:ml-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onChangeViewMode("grid")}
            aria-label="Grid View"
            className={cn(
              "h-9 w-9 rounded-md border",
              viewMode === "grid"
                ? "bg-primary/10 ring-2 ring-primary/60"
                : "bg-transparent hover:bg-muted",
              "[&_svg]:!size-6",
              "transition-colors",
            )}
          >
            <ToGridIcon toggle={viewMode === "grid"} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">그리드 보기</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onChangeViewMode("compact")}
            aria-label="List View"
            className={cn(
              "h-9 w-9 rounded-md border",
              viewMode === "compact"
                ? "bg-primary/10 ring-2 ring-primary/60"
                : "bg-transparent hover:bg-muted",
              "[&_svg]:!size-6",
              "transition-colors",
            )}
          >
            <ToListIcon toggle={viewMode === "compact"} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">리스트 보기</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default ViewModeControl;
