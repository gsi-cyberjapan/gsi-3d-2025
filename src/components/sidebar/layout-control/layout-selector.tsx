"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutMode } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { Columns2, Layers2, Map } from "lucide-react";
import { LayoutDetailButton } from "./layout-detail-button";

export const LayoutSelector = () => {
  const layoutMode = useStore((state) => state.layoutMode);
  const setLayouteMode = useStore((state) => state.setLayoutMode);

  return (
    <div className="flex gap-2">
      <Select value={layoutMode} onValueChange={setLayouteMode}>
        <SelectTrigger className="w-full" size="sm">
          <SelectValue>
            <LayoutSelectItem layoutMode={layoutMode} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="end">
          {(["single", "split", "overlay"] as LayoutMode[]).map((mode) => (
            <SelectItem key={mode} value={mode} className="cursor-pointer">
              <LayoutSelectItem layoutMode={mode} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {(layoutMode === "split" || layoutMode === "overlay") && (
        <LayoutDetailButton />
      )}
    </div>
  );
};

interface LayoutSelectItemProps {
  layoutMode: LayoutMode;
}
const LayoutSelectItem = ({ layoutMode }: LayoutSelectItemProps) => {
  return (
    <div className="flex gap-2 items-center">
      {(() => {
        if (layoutMode === "overlay") {
          return (
            <>
              <Layers2 />
              <span>重ねる</span>
            </>
          );
        } else if (layoutMode === "split") {
          return (
            <>
              <Columns2 />
              <span>分割</span>
            </>
          );
        } else {
          return (
            <>
              <Map />
              <span>通常</span>
            </>
          );
        }
      })()}
    </div>
  );
};
