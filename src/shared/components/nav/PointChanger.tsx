import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/shadcn/dropdown-menu";
import { setPointColor } from "@/lib/util/setPointColor";

const PointChanger = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="size-8 bg-point rounded-full overflow-hidden p-0 relative border-solid" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setPointColor("amber")}>
          <div className="w-8 h-8 rounded-full border border-muted bg-[hsl(42_94%_58%)] mr-2" />
          <p>Amber</p>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPointColor("sky")}>
          <div className="w-8 h-8 rounded-full border border-muted bg-[hsl(198_93%_60%)] mr-2" />
          <p>Sky</p>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPointColor("purple")}>
          <div className="w-8 h-8 rounded-full border border-muted bg-[hsl(262_83%_67%)] mr-2" />
          <p>Purple</p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PointChanger;
