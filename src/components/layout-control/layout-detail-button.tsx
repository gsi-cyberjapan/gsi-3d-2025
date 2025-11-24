"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/store/useStore";
import { LayoutDetailSplit } from "./layout-detail-split";
import { LayoutDetailOverlay } from "./layout-detail-overlay";

export const LayoutDetailButton = () => {
  const layoutMode = useStore((state) => state.layoutMode);

  if (layoutMode === "single") {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="font-normal" variant="outline" size="sm">
          詳細
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2" align="start">
        {layoutMode === "split" ? (
          <LayoutDetailSplit />
        ) : (
          <LayoutDetailOverlay />
        )}
      </PopoverContent>
    </Popover>
  );
};
