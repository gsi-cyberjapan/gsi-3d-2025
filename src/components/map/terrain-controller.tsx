"use client";

import { useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";
import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { TERRAIN_CONFIG } from "@/lib/config";

interface Props {
  mapId: MapId;
}

const TERRAIN_SOURCE_ID = "terrain-dem";

export const TerrainController = ({ mapId }: Props) => {
  const isTerrainEnabled = useStore(
    (state) => state.maps[mapId].isTerrainEnabled,
  );
  const mapInstance = useMap()[mapId]?.getMap();

  useEffect(() => {
    if (!mapInstance) return;

    const apply = () => {
      if (isTerrainEnabled) {
        // Add DEM source if it doesn't exist
        if (!mapInstance.getSource(TERRAIN_SOURCE_ID)) {
          mapInstance.addSource(TERRAIN_SOURCE_ID, {
            type: "raster-dem",
            tiles: [TERRAIN_CONFIG.DEM_TILE_URL],
            tileSize: 256,
            encoding: TERRAIN_CONFIG.DEM_ENCODING,
            minzoom: TERRAIN_CONFIG.DEM_MIN_ZOOM,
            maxzoom: TERRAIN_CONFIG.DEM_MAX_ZOOM,
          });
        }
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
  }, [mapInstance, isTerrainEnabled]);

  return null;
};
