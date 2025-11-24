"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";

interface Props {
  mapId: MapId;
}

export const ZoomLevelController = ({ mapId }: Props) => {
  const map = useMap()[mapId]?.getMap();
  const baseLayer = useStore((state) => state.maps[mapId].baseLayer);

  useEffect(() => {
    if (!map) return;
    const currentZoom = map.getZoom();

    if (baseLayer.type === "globe") {
      if (currentZoom > baseLayer.maxZoom) {
        map.setZoom(baseLayer.maxZoom);
      }
      map.setMaxZoom(baseLayer.maxZoom);
    } else {
      if (currentZoom > baseLayer.maxZoom) {
        map.setZoom(baseLayer.maxZoom);
      } else if (currentZoom < baseLayer.minZoom) {
        map.setZoom(baseLayer.minZoom);
      }
      map.setMaxZoom(baseLayer.maxZoom);
      map.setMinZoom(baseLayer.minZoom);
    }

    return () => {
      map.setMinZoom(null);
      map.setMaxZoom(null);
    };
  }, [baseLayer, map]);

  return null;
};
