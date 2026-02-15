"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { TERRAIN_CONFIG } from "@/lib/config";

interface Props {
  mapId: MapId;
}

export const HillshadeLayer = ({ mapId }: Props) => {
  const isHillshadeEnabled = useStore(
    (state) => state.maps[mapId].isHillshadeEnabled,
  );

  if (!isHillshadeEnabled) {
    return null;
  }

  return (
    <Source
      id={`${mapId}-standalone-dem`}
      type="raster-dem"
      tiles={[TERRAIN_CONFIG.DEM_TILE_URL]}
      tileSize={256}
      encoding={TERRAIN_CONFIG.DEM_ENCODING}
      minzoom={TERRAIN_CONFIG.DEM_MIN_ZOOM}
      maxzoom={TERRAIN_CONFIG.DEM_MAX_ZOOM}
    >
      <Layer
        id={`${mapId}-standalone-hillshade`}
        type="hillshade"
        paint={{
          "hillshade-exaggeration": TERRAIN_CONFIG.HILLSHADE_EXAGGERATION,
          "hillshade-shadow-color": "#000000",
          "hillshade-highlight-color": "#FFFFFF",
          "hillshade-illumination-anchor": "viewport",
        }}
      />
    </Source>
  );
};
