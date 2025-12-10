"use client";

import { Layer, Source } from "react-map-gl/maplibre";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";

interface Props {
  mapId: MapId;
}

const buildSourceId = (mapId: MapId, layerId: string) =>
  `${mapId}-optional-${layerId}-source`;
const buildLayerId = (mapId: MapId, layerId: string) =>
  `${mapId}-optional-${layerId}-layer`;

export const OptionalLayers = ({ mapId }: Props) => {
  const optionalLayers = useStore((state) => state.maps[mapId].optionalLayers);

  if (optionalLayers.length === 0) {
    return null;
  }

  return (
    <>
      {optionalLayers.map((layer, index) => {
        const sourceId = buildSourceId(mapId, layer.layerId);
        const rasterLayerId = buildLayerId(mapId, layer.layerId);
        const minzoom = layer.minZoom ?? undefined;
        const maxzoom = layer.maxZoom ?? undefined;
        const beforeId =
          index === 0
            ? undefined
            : buildLayerId(mapId, optionalLayers[index - 1].layerId);

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
              {...(minzoom !== undefined ? { minzoom } : {})}
              {...(maxzoom !== undefined ? { maxzoom } : {})}
            />
          </Source>
        );
      })}
    </>
  );
};
