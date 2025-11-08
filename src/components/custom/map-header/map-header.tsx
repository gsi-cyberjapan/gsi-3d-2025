"use client";

import { MapLinkPositionSelect } from "./map-link-position-select";
import { MapViewModeSelect } from "./map-view-mode-select";
import { useGlobalStore } from "@/hooks/store/useGlobalStore";

export const MapHeader = () => {
  const viewMode = useGlobalStore((state) => state.viewMode);

  return (
    <div className="h-10 flex items-center justify-end gap-2">
      {(viewMode === "split" || viewMode === "overlap") && (
        <MapLinkPositionSelect />
      )}
      <MapViewModeSelect />
    </div>
  );
};
