"use client";

import { useMemo } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import type { RasterDEMSourceSpecification } from "maplibre-gl";
import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { buildColorInterpolation } from "@/lib/relief/buildColorInterpolation";
import { TERRAIN_CONFIG, getDemSourceById } from "@/lib/config";

interface Props {
  mapId: MapId;
}

const RELIEF_FREE_LAYER_ID = "relief_free";

export const ReliefLayer = ({ mapId }: Props) => {
  const optionalLayers = useStore((state) => state.maps[mapId].optionalLayers);
  const elevationRanges = useStore((state) => state.elevationRanges);
  const isHillshadeEnabled = useStore((state) => state.isHillshadeEnabled);
  const selectedDemSourceId = useStore((state) => state.selectedDemSourceId);

  const demSourceConfig = useMemo((): Omit<
    RasterDEMSourceSpecification,
    "type"
  > => {
    const demSource = getDemSourceById(selectedDemSourceId);
    return {
      tiles: [demSource.tileUrl],
      tileSize: 256,
      encoding: TERRAIN_CONFIG.DEM_ENCODING,
      minzoom: TERRAIN_CONFIG.DEM_MIN_ZOOM,
      maxzoom: demSource.maxZoom,
    };
  }, [selectedDemSourceId]);

  const reliefLayerEntry = optionalLayers.find(
    (layer) => layer.layerId === RELIEF_FREE_LAYER_ID,
  );

  const colorExpression = useMemo(
    () => buildColorInterpolation(elevationRanges),
    [elevationRanges],
  );

  if (!reliefLayerEntry) {
    return null;
  }

  // Apply layer opacity from store, with hillshade reducing it further
  const layerOpacity = reliefLayerEntry.opacity;
  const colorReliefOpacity = isHillshadeEnabled
    ? layerOpacity * 0.75
    : layerOpacity;

  return (
    <Source
      key={selectedDemSourceId}
      id={`${mapId}-gsi-dem-${selectedDemSourceId}`}
      type="raster-dem"
      {...demSourceConfig}
    >
      {/* Hillshade layer (renders first, below color-relief) */}
      <Layer
        id={`${mapId}-hillshade`}
        type="hillshade"
        paint={{
          "hillshade-exaggeration": 0.5,
          "hillshade-shadow-color": "#000000",
          "hillshade-highlight-color": "#FFFFFF",
          "hillshade-illumination-anchor": "viewport",
        }}
        layout={{
          visibility: isHillshadeEnabled ? "visible" : "none",
        }}
      />
      {/* Color relief layer */}
      <Layer
        id={`${mapId}-color-relief`}
        type="color-relief"
        paint={{
          "color-relief-color": colorExpression,
          "color-relief-opacity": colorReliefOpacity,
        }}
      />
    </Source>
  );
};
