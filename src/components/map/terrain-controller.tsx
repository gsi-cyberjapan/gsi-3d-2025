"use client";

import { useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";
import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { TERRAIN_CONFIG, getDemSourceById } from "@/lib/config";

interface Props {
  mapId: MapId;
}

const TERRAIN_SOURCE_ID = "terrain-dem";

export const TerrainController = ({ mapId }: Props) => {
  const isTerrainEnabled = useStore(
    (state) => state.maps[mapId].isTerrainEnabled,
  );
  const selectedDemSourceId = useStore((state) => state.selectedDemSourceId);
  const mapInstance = useMap()[mapId]?.getMap();

  useEffect(() => {
    if (!mapInstance) return;

    const demSource = getDemSourceById(selectedDemSourceId);

    const apply = () => {
      if (isTerrainEnabled) {
        // Remove existing terrain source if it exists (DEM source may have changed)
        if (mapInstance.getSource(TERRAIN_SOURCE_ID)) {
          mapInstance.setTerrain(null);
          mapInstance.removeSource(TERRAIN_SOURCE_ID);
        }
        mapInstance.addSource(TERRAIN_SOURCE_ID, {
          type: "raster-dem",
          tiles: [demSource.tileUrl],
          tileSize: 256,
          encoding: TERRAIN_CONFIG.DEM_ENCODING,
          minzoom: TERRAIN_CONFIG.DEM_MIN_ZOOM,
          maxzoom: demSource.maxZoom,
        });
        mapInstance.setTerrain({
          source: TERRAIN_SOURCE_ID,
          exaggeration: TERRAIN_CONFIG.TERRAIN_EXAGGERATION,
        });
      } else {
        mapInstance.setTerrain(null);
      }
    };

    if (mapInstance.isStyleLoaded()) {
      apply();
    } else {
      void mapInstance.once("style.load", apply);
    }

    return () => {
      mapInstance.off("style.load", apply);
    };
  }, [mapInstance, isTerrainEnabled, selectedDemSourceId]);

  return null;
};
