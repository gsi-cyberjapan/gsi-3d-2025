"use client";

import { useMemo } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import type { RasterDEMSourceSpecification } from "maplibre-gl";
import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { buildColorInterpolation } from "@/lib/relief/buildColorInterpolation";

interface Props {
  mapId: MapId;
}

const RELIEF_FREE_LAYER_ID = "relief_free";

// GSI DEM tile source configuration
const GSI_DEM_SOURCE: Omit<RasterDEMSourceSpecification, "type"> = {
  tiles: ["https://cyberjapandata.gsi.go.jp/xyz/dem_png/{z}/{x}/{y}.png"],
  tileSize: 256,
  encoding: "custom",
  redFactor: 655.36,
  greenFactor: 2.56,
  blueFactor: 0.01,
  baseShift: 0,
  minzoom: 0,
  maxzoom: 14,
};

export const ReliefLayer = ({ mapId }: Props) => {
  const optionalLayers = useStore((state) => state.maps[mapId].optionalLayers);
  const elevationRanges = useStore((state) => state.elevationRanges);
  const isHillshadeEnabled = useStore((state) => state.isHillshadeEnabled);

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
    <Source id={`${mapId}-gsi-dem`} type="raster-dem" {...GSI_DEM_SOURCE}>
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
