"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { TERRAIN_CONFIG, getDemSourceById } from "@/lib/config";

interface Props {
  mapId: MapId;
}

export const HillshadeLayer = ({ mapId }: Props) => {
  const isHillshadeEnabled = useStore(
    (state) => state.maps[mapId].isHillshadeEnabled,
  );
  const selectedDemSourceId = useStore((state) => state.selectedDemSourceId);

  if (!isHillshadeEnabled) {
    return null;
  }

  const demSource = getDemSourceById(selectedDemSourceId);

  return (
    <Source
      key={selectedDemSourceId}
      id={`${mapId}-standalone-dem-${selectedDemSourceId}`}
      type="raster-dem"
      tiles={[demSource.tileUrl]}
      tileSize={256}
      encoding={TERRAIN_CONFIG.DEM_ENCODING}
      minzoom={TERRAIN_CONFIG.DEM_MIN_ZOOM}
      maxzoom={demSource.maxZoom}
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
