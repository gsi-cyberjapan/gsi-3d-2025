"use client";

import { Layer, Source } from "react-map-gl/maplibre";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";

interface Props {
  mapId: MapId;
}

// relief_free is handled by ReliefLayer component with custom color-relief rendering
const RELIEF_FREE_LAYER_ID = "relief_free";

const buildSourceId = (mapId: MapId, layerId: string) =>
  `${mapId}-optional-${layerId}-source`;
const buildLayerId = (mapId: MapId, layerId: string) =>
  `${mapId}-optional-${layerId}-layer`;

export const OptionalLayers = ({ mapId }: Props) => {
  const optionalLayers = useStore((state) => state.maps[mapId].optionalLayers);

  // Exclude relief_free - it's handled by ReliefLayer component
  const layersToRender = optionalLayers.filter(
    (layer) => layer.layerId !== RELIEF_FREE_LAYER_ID,
  );

  if (layersToRender.length === 0) {
    return null;
  }

  return (
    <>
      {layersToRender.map((layer, index) => {
        const sourceId = buildSourceId(mapId, layer.layerId);
        const rasterLayerId = buildLayerId(mapId, layer.layerId);
        const minzoom = layer.minZoom ?? undefined;
        const maxzoom = layer.maxZoom ?? undefined;
        const beforeId =
          index === 0
            ? undefined
            : buildLayerId(mapId, layersToRender[index - 1].layerId);

        // TODO: GeoJson対応　https://qiita.com/mg_kudo/items/832ee30ed39b6c25df60

        return (
          <Source
            key={sourceId}
            id={sourceId}
            type="raster"
            tiles={[layer.tileUrl]}
            tileSize={256}
            {...(minzoom !== undefined ? { minzoom } : {})}
            {...(maxzoom !== undefined ? { maxzoom } : {})}
          >
            <Layer
              id={rasterLayerId}
              type="raster"
              source={sourceId}
              beforeId={beforeId}
              paint={{ "raster-opacity": layer.opacity }}
              layout={{ visibility: layer.visible === false ? "none" : "visible" }}
              {...(minzoom !== undefined ? { minzoom } : {})}
              {...(maxzoom !== undefined ? { maxzoom } : {})}
            />
          </Source>
        );
      })}
    </>
  );
};
