"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import {
  getMeshConfig,
  get1stMeshCode,
  get2ndMeshCode,
} from "@/lib/grids/regionalMesh";
import { useMemo } from "react";
import { Source, Layer, useMap } from "react-map-gl/maplibre";

interface Props {
  mapId: MapId;
}

const buildRegionalMeshData = (map: maplibregl.Map) => {
  const bounds = map.getBounds();
  const zoom = Math.floor(map.getZoom());
  const config = getMeshConfig(zoom);

  if (!config) return null;

  const south = bounds.getSouth();
  const north = bounds.getNorth();
  const west = bounds.getWest();
  const east = bounds.getEast();

  const { latInterval, lngInterval } = config;

  const startLat = Math.floor(south / latInterval) * latInterval;
  const startLng = Math.floor(west / lngInterval) * lngInterval;

  const lineFeatures = [];
  const labelFeatures = [];

  // Horizontal lines
  for (let lat = startLat; lat <= north + latInterval; lat += latInterval) {
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

  // Vertical lines
  for (let lng = startLng; lng <= east + lngInterval; lng += lngInterval) {
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

  // Labels at mesh center
  for (let lat = startLat; lat <= north; lat += latInterval) {
    for (let lng = startLng; lng <= east; lng += lngInterval) {
      const centerLat = lat + latInterval / 2;
      const centerLng = lng + lngInterval / 2;

      if (
        centerLat < 20 ||
        centerLat > 46 ||
        centerLng < 122 ||
        centerLng > 154
      ) {
        continue;
      }

      let code: string;
      if (zoom <= 7) {
        code = get1stMeshCode(centerLat, centerLng);
      } else {
        code = get2ndMeshCode(centerLat, centerLng);
      }

      labelFeatures.push({
        type: "Feature" as const,
        properties: { label: code },
        geometry: {
          type: "Point" as const,
          coordinates: [centerLng, centerLat] as [number, number],
        },
      });
    }
  }

  return {
    type: "FeatureCollection" as const,
    features: [...lineFeatures, ...labelFeatures],
  };
};

export const RegionalMeshController = ({ mapId }: Props) => {
  const map = useMap()[mapId]?.getMap();
  const isDisplayRegionalMesh = useStore(
    (state) => state.isDisplayRegionalMesh,
  );
  const viewState = useStore((state) => state.viewStates[mapId]);

  const geojsonData = useMemo(() => {
    if (!map || !isDisplayRegionalMesh || !viewState) return null;
    return buildRegionalMeshData(map);
  }, [map, isDisplayRegionalMesh, viewState]);

  if (!geojsonData) return null;

  return (
    <Source id={`${mapId}-regional-mesh`} type="geojson" data={geojsonData}>
      <Layer
        id={`${mapId}-regional-mesh-lines`}
        type="line"
        filter={["==", "$type", "LineString"]}
        paint={{
          "line-color": "#00AA00",
          "line-width": 1,
          "line-opacity": 0.8,
          "line-dasharray": [3, 3],
        }}
      />
      <Layer
        id={`${mapId}-regional-mesh-labels`}
        type="symbol"
        filter={["==", "$type", "Point"]}
        layout={{
          "text-field": ["get", "label"],
          "text-size": 12,
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-anchor": "center",
          "text-allow-overlap": true,
        }}
        paint={{
          "text-color": "#00AA00",
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
        }}
      />
    </Source>
  );
};
