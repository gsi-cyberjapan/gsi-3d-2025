"use client";

import { useMap } from "react-map-gl/maplibre";
import { useStore } from "@/hooks/store/useStore";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { DEFAULT_VIEW_CONFIG } from "@/lib/config";
import { useCallback } from "react";
import { MapId } from "@/hooks/store/mapManagerState";

interface Props {
  mapId: MapId;
}

export const ResetViewButton = ({ mapId }: Props) => {
  const mainMap = useMap()["main"]?.getMap();
  const subMap = useMap()["sub"]?.getMap();
  const activeMapIds = useStore((state) => state.activeMapIds);
  const isSyncPosition = useStore((state) => state.isSyncPosition);

  const handleResetView = useCallback(() => {
    const center = {
      lng: DEFAULT_VIEW_CONFIG.LONGITUDE,
      lat: DEFAULT_VIEW_CONFIG.LATITUDE,
    };
    const zoom = DEFAULT_VIEW_CONFIG.ZOOM;
    const bearing = DEFAULT_VIEW_CONFIG.BEARING;
    const pitch = DEFAULT_VIEW_CONFIG.PITCH;

    const flyToOptions = {
      center,
      zoom,
      bearing,
      pitch,
      duration: 500,
    };

    if (isSyncPosition) {
      // Position sync enabled: reset all active maps
      if (mainMap && activeMapIds.includes("main")) {
        mainMap.flyTo(flyToOptions);
      }
      if (subMap && activeMapIds.includes("sub")) {
        subMap.flyTo(flyToOptions);
      }
    } else {
      // Position sync disabled: reset only this map
      const targetMap = mapId === "main" ? mainMap : subMap;
      if (targetMap) {
        targetMap.flyTo(flyToOptions);
      }
    }
  }, [mainMap, subMap, activeMapIds, isSyncPosition, mapId]);

  return (
    <Button
      variant="outline"
      size="xs"
      onClick={handleResetView}
      className="gap-1 dark:bg-muted dark:hover:bg-muted h-6"
    >
      <Eye className="size-3" />
      <span className="text-xs">視点リセット</span>
    </Button>
  );
};
