"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import {
  getLatLngGridIntervalSeconds,
  secondsToDms,
} from "@/lib/grids/latLngGrid";
import { useMemo } from "react";
import { Source, Layer, useMap } from "react-map-gl/maplibre";

interface Props {
  mapId: MapId;
}

const buildLatLngGridData = (map: maplibregl.Map) => {
  const bounds = map.getBounds();
  const zoom = Math.floor(map.getZoom());
  const intervalSec = getLatLngGridIntervalSeconds(zoom);

  const south = bounds.getSouth();
  const north = bounds.getNorth();
  const west = bounds.getWest();
  const east = bounds.getEast();

  const startLat =
    Math.floor(Math.floor(south * 3600) / intervalSec) * intervalSec;
  const endLat = Math.ceil(north * 3600);
  const startLng =
    Math.floor(Math.floor(west * 3600) / intervalSec) * intervalSec;
  const endLng = Math.ceil(east * 3600);

  const lineFeatures = [];
  const labelFeatures = [];

  // Horizontal lines (latitude)
  for (let y = startLat; y <= endLat + intervalSec; y += intervalSec) {
    const lat = y / 3600;
    if (lat < -80 || lat > 80) continue;
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
    labelFeatures.push({
      type: "Feature" as const,
      properties: { label: secondsToDms(y, true) },
      geometry: {
        type: "Point" as const,
        coordinates: [west + (east - west) * 0.02, lat] as [number, number],
      },
    });
  }

  // Vertical lines (longitude)
  for (let x = startLng; x <= endLng + intervalSec; x += intervalSec) {
    const lng = x / 3600;
    if (lng < -180 || lng > 180) continue;
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
    labelFeatures.push({
      type: "Feature" as const,
      properties: { label: secondsToDms(x, false) },
      geometry: {
        type: "Point" as const,
        coordinates: [lng, south + (north - south) * 0.02] as [number, number],
      },
    });
  }

  return {
    type: "FeatureCollection" as const,
    features: [...lineFeatures, ...labelFeatures],
  };
};

export const LatLngGridController = ({ mapId }: Props) => {
  const map = useMap()[mapId]?.getMap();
  const isDisplayLatLngGrid = useStore((state) => state.isDisplayLatLngGrid);
  const viewState = useStore((state) => state.viewStates[mapId]);

  const geojsonData = useMemo(() => {
    if (!map || !isDisplayLatLngGrid || !viewState) return null;
    return buildLatLngGridData(map);
  }, [map, isDisplayLatLngGrid, viewState]);

  if (!geojsonData) return null;

  return (
    <Source id={`${mapId}-latlng-grid`} type="geojson" data={geojsonData}>
      <Layer
        id={`${mapId}-latlng-grid-lines`}
        type="line"
        filter={["==", "$type", "LineString"]}
        paint={{
          "line-color": "#1D417A",
          "line-width": 1,
          "line-opacity": 1,
          "line-dasharray": [3, 3],
        }}
      />
      <Layer
        id={`${mapId}-latlng-grid-labels`}
        type="symbol"
        filter={["==", "$type", "Point"]}
        layout={{
          "text-field": ["get", "label"],
          "text-size": 12,
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-anchor": "bottom-left",
          "text-allow-overlap": true,
        }}
        paint={{
          "text-color": "#1D417A",
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
        }}
      />
    </Source>
  );
};
