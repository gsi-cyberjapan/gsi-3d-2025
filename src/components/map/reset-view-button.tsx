"use client";

import { useMap } from "react-map-gl/maplibre";
import { useStore } from "@/hooks/store/useStore";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { DEFAULT_VIEW_CONFIG } from "@/lib/config";
import { useCallback } from "react";

export const ResetViewButton = () => {
  const mainMap = useMap()["main"]?.getMap();
  const subMap = useMap()["sub"]?.getMap();
  const activeMapIds = useStore((state) => state.activeMapIds);

  const handleResetView = useCallback(() => {
    const center = {
      lng: DEFAULT_VIEW_CONFIG.LONGITUDE,
      lat: DEFAULT_VIEW_CONFIG.LATITUDE,
    };
    const zoom = DEFAULT_VIEW_CONFIG.ZOOM;
    const bearing = DEFAULT_VIEW_CONFIG.BEARING;
    const pitch = DEFAULT_VIEW_CONFIG.PITCH;

    if (mainMap && activeMapIds.includes("main")) {
      mainMap.flyTo({
        center,
        zoom,
        bearing,
        pitch,
        duration: 900,
      });
    }

    if (subMap && activeMapIds.includes("sub")) {
      subMap.flyTo({
        center,
        zoom,
        bearing,
        pitch,
        duration: 900,
      });
    }
  }, [mainMap, subMap, activeMapIds]);

  return (
    <Button
      variant="outline"
      size="xs"
      onClick={handleResetView}
      className="gap-1 bg-background hover:bg-background dark:bg-background dark:hover:bg-background"
    >
      <Home className="size-3" />
      <span className="text-xs">視点リセット</span>
    </Button>
  );
};
