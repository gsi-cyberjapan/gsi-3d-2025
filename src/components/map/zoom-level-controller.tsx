"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { ZOOM_CONFIG } from "@/lib/config";
import { useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";

interface Props {
  mapId: MapId;
}

export const ZoomLevelController = ({ mapId }: Props) => {
  const map = useMap()[mapId]?.getMap();
  const projection = useStore((state) => state.maps[mapId].projection);

  useEffect(() => {
    if (!map) return;
    const currentZoom = map.getZoom();

    if (projection === "globe") {
      if (currentZoom > ZOOM_CONFIG.GLOBE_MAX_ZOOM) {
        map.setZoom(ZOOM_CONFIG.GLOBE_MAX_ZOOM);
      } else if (currentZoom < ZOOM_CONFIG.GLOBE_MIN_ZOOM) {
        map.setZoom(ZOOM_CONFIG.GLOBE_MIN_ZOOM);
      }
      map.setMinZoom(ZOOM_CONFIG.GLOBE_MIN_ZOOM);
      map.setMaxZoom(ZOOM_CONFIG.GLOBE_MAX_ZOOM);
    } else {
      if (currentZoom > ZOOM_CONFIG.RASTER_VECTOR_MAX_ZOOM) {
        map.setZoom(ZOOM_CONFIG.RASTER_VECTOR_MAX_ZOOM);
      } else if (currentZoom < ZOOM_CONFIG.RASTER_VECTOR_MIN_ZOOM) {
        map.setZoom(ZOOM_CONFIG.RASTER_VECTOR_MIN_ZOOM);
      }
      map.setMinZoom(ZOOM_CONFIG.RASTER_VECTOR_MIN_ZOOM);
      map.setMaxZoom(ZOOM_CONFIG.RASTER_VECTOR_MAX_ZOOM);
    }

    return () => {
      map.setMinZoom(null);
      map.setMaxZoom(null);
    };
  }, [projection, map]);

  return null;
};
