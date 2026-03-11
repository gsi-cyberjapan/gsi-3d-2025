"use client";

import { Source } from "react-map-gl/maplibre";
import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { TERRAIN_CONFIG, getDemSourceById } from "@/lib/config";

interface Props {
  mapId: MapId;
}

export const TERRAIN_SOURCE_ID = "terrain-dem";

export const TerrainSource = ({ mapId }: Props) => {
  const isTerrainEnabled = useStore(
    (state) => state.maps[mapId].isTerrainEnabled,
  );
  const selectedDemSourceId = useStore((state) => state.selectedDemSourceId);

  if (!isTerrainEnabled) {
    return null;
  }

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
