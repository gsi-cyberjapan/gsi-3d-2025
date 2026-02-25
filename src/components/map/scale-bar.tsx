"use client";

import { useMemo } from "react";
import { ScaleControl } from "react-map-gl/maplibre";
import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";

interface Props {
  mapId: MapId;
}

export const ScaleBar = ({ mapId }: Props) => {
  const layoutMode = useStore((state) => state.layoutMode);

  const shouldShow = useMemo(() => {
    if (layoutMode === "single") {
      return mapId === "main";
    } else if (layoutMode === "split") {
      return true;
    } else {
      // overlay: subマップにのみ表示
      return mapId === "sub";
    }
  }, [layoutMode, mapId]);

  if (!shouldShow) return null;

  return <ScaleControl position="bottom-left" unit="metric" />;
};
