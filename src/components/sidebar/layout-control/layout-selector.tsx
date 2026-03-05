"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutMode, MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { Columns2, Layers2, Map } from "lucide-react";
import { LayoutDetailButton } from "./layout-detail-button";

export const LayoutSelector = () => {
  const layoutMode = useStore((state) => state.layoutMode);
  const setLayouteMode = useStore((state) => state.setLayoutMode);
  const focusMapId = useStore((state) => state.focusMapId);
  const setFocusMapId = useStore((state) => state.setFocusMapId);

  const focusLabel = (id: MapId) => {
    if (layoutMode === "split") {
      return id === "main" ? "左の地図" : "右の地図";
    }
    return id === "main" ? "背面の地図" : "手前の地図";
  };

  return (
    <div className="flex flex-col gap-1">
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
      {(layoutMode === "split" || layoutMode === "overlay") && (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">操作対象</span>
          <Select value={focusMapId} onValueChange={setFocusMapId}>
            <SelectTrigger size="sm" className="w-full">
              <SelectValue>{focusLabel(focusMapId)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(["main", "sub"] as MapId[]).map((id) => (
                <SelectItem key={id} value={id} className="cursor-pointer">
                  {focusLabel(id)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
              <span>重ねて比較</span>
            </>
          );
        } else if (layoutMode === "split") {
          return (
            <>
              <Columns2 />
              <span>並べて比較</span>
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
