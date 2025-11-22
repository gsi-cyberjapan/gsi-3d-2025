"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { useMap } from "@vis.gl/react-maplibre";
import { useEffect } from "react";

interface Props {
  mapId: MapId;
}

export const BaseLayer = ({ mapId }: Props) => {
  const baseLayer = useStore((state) => state.maps[mapId].baseLayer);
  const map = useMap()[mapId]?.getMap();

  useEffect(() => {
    if (!map) {
      return;
    } else if (baseLayer.type === "vector") {
      map.setStyle(baseLayer.styleUrl);
    }

    return () => {};
  }, [baseLayer, map]);

  return null;
};
