"use client";

import { Source } from "react-map-gl/maplibre";
import { useStore } from "@/hooks/store/useStore";
import { TERRAIN_CONFIG, getDemSourceById } from "@/lib/config";

export const TERRAIN_SOURCE_ID = "terrain-dem";

export const TerrainSource = () => {
  const selectedDemSourceId = useStore((state) => state.selectedDemSourceId);
  const demSource = getDemSourceById(selectedDemSourceId);

  return (
    <Source
      key={selectedDemSourceId}
      id={TERRAIN_SOURCE_ID}
      type="raster-dem"
      tiles={[demSource.tileUrl]}
      tileSize={256}
      encoding={TERRAIN_CONFIG.DEM_ENCODING}
      minzoom={TERRAIN_CONFIG.DEM_MIN_ZOOM}
      maxzoom={demSource.maxZoom}
    />
  );
};
