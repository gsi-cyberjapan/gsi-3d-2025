"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import {
  latToTileY,
  lngToTileX,
  tileYToLat,
  tileXToLng,
} from "@/lib/grids/tileGrid";
import { useMemo } from "react";
import { Source, Layer, useMap } from "react-map-gl/maplibre";

interface Props {
  mapId: MapId;
}

const buildTileGridData = (map: maplibregl.Map) => {
  const bounds = map.getBounds();
  const zoom = Math.floor(map.getZoom());

  const south = bounds.getSouth();
  const north = bounds.getNorth();
  const west = bounds.getWest();
  const east = bounds.getEast();

  const minTileX = lngToTileX(west, zoom);
  const maxTileX = lngToTileX(east, zoom);
  const minTileY = latToTileY(north, zoom);
  const maxTileY = latToTileY(south, zoom);

  const lineFeatures = [];
  const labelFeatures = [];

  for (let x = minTileX; x <= maxTileX + 1; x++) {
    const lng = tileXToLng(x, zoom);
    lineFeatures.push({
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [lng, south] as [number, number],
          [lng, north] as [number, number],
        ],
      },
    });
  }

  for (let y = minTileY; y <= maxTileY + 1; y++) {
    const lat = tileYToLat(y, zoom);
    lineFeatures.push({
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [west, lat] as [number, number],
          [east, lat] as [number, number],
        ],
      },
    });
  }

  // Labels at center of each tile
  for (let x = minTileX; x <= maxTileX; x++) {
    for (let y = minTileY; y <= maxTileY; y++) {
      const tileLng = (tileXToLng(x, zoom) + tileXToLng(x + 1, zoom)) / 2;
      const tileLat = (tileYToLat(y, zoom) + tileYToLat(y + 1, zoom)) / 2;

      labelFeatures.push({
        type: "Feature" as const,
        properties: { label: `${String(zoom)}/${String(x)}/${String(y)}` },
        geometry: {
          type: "Point" as const,
          coordinates: [tileLng, tileLat] as [number, number],
        },
      });
    }
  }

  return {
    type: "FeatureCollection" as const,
    features: [...lineFeatures, ...labelFeatures],
  };
};

export const TileGridController = ({ mapId }: Props) => {
  const map = useMap()[mapId]?.getMap();
  const isDisplayTileGrid = useStore((state) => state.isDisplayTileGrid);
  const viewState = useStore((state) => state.viewStates[mapId]);

  const geojsonData = useMemo(() => {
    if (!map || !isDisplayTileGrid || !viewState) return null;
    return buildTileGridData(map);
  }, [map, isDisplayTileGrid, viewState]);

  if (!geojsonData) return null;

  return (
    <Source id={`${mapId}-tile-grid`} type="geojson" data={geojsonData}>
      <Layer
        id={`${mapId}-tile-grid-lines`}
        type="line"
        filter={["==", "$type", "LineString"]}
        paint={{
          "line-color": "#FF0000",
          "line-width": 1,
          "line-opacity": 1,
          "line-dasharray": [3, 3],
        }}
      />
      <Layer
        id={`${mapId}-tile-grid-labels`}
        type="symbol"
        filter={["==", "$type", "Point"]}
        layout={{
          "text-field": ["get", "label"],
          "text-size": 14,
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-anchor": "center",
          "text-allow-overlap": true,
        }}
        paint={{
          "text-color": "#FF0000",
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
        }}
      />
    </Source>
  );
};
