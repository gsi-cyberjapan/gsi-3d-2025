"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { lngToUtmZone, getUtmLatBand } from "@/lib/grids/utmGrid";
import { useMemo } from "react";
import { Source, Layer, useMap } from "react-map-gl/maplibre";

interface Props {
  mapId: MapId;
}

const buildUtmZoneGridData = (map: maplibregl.Map) => {
  const bounds = map.getBounds();
  const south = Math.max(bounds.getSouth(), -80);
  const north = Math.min(bounds.getNorth(), 84);
  const west = bounds.getWest();
  const east = bounds.getEast();

  const lineFeatures = [];
  const labelFeatures = [];

  // 6° zone boundaries (vertical lines)
  const startZoneLng = Math.floor(west / 6) * 6;
  for (let lng = startZoneLng; lng <= east; lng += 6) {
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

  // 8° latitude band boundaries (horizontal lines)
  for (let lat = -80; lat <= 84; lat += 8) {
    if (lat < south || lat > north) continue;
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

  // Zone labels
  for (let lng = startZoneLng; lng < east; lng += 6) {
    const zoneCenterLng = lng + 3;
    if (zoneCenterLng < west || zoneCenterLng > east) continue;
    const zone = lngToUtmZone(zoneCenterLng);

    for (let lat = -80; lat < 84; lat += 8) {
      const bandCenterLat = lat + 4;
      if (bandCenterLat < south || bandCenterLat > north) continue;
      const band = getUtmLatBand(bandCenterLat);

      labelFeatures.push({
        type: "Feature" as const,
        properties: { label: `${String(zone)}${band}` },
        geometry: {
          type: "Point" as const,
          coordinates: [zoneCenterLng, bandCenterLat] as [number, number],
        },
      });
    }
  }

  return {
    type: "FeatureCollection" as const,
    features: [...lineFeatures, ...labelFeatures],
  };
};

export const UtmGridController = ({ mapId }: Props) => {
  const map = useMap()[mapId]?.getMap();
  const isDisplayUtmGrid = useStore((state) => state.isDisplayUtmGrid);
  const viewState = useStore((state) => state.viewStates[mapId]);

  const geojsonData = useMemo(() => {
    if (!map || !isDisplayUtmGrid || !viewState) return null;
    return buildUtmZoneGridData(map);
  }, [map, isDisplayUtmGrid, viewState]);

  if (!geojsonData) return null;

  return (
    <Source id={`${mapId}-utm-grid`} type="geojson" data={geojsonData}>
      <Layer
        id={`${mapId}-utm-grid-lines`}
        type="line"
        filter={["==", "$type", "LineString"]}
        paint={{
          "line-color": "#FF0000",
          "line-width": 2,
          "line-opacity": 1,
        }}
      />
      <Layer
        id={`${mapId}-utm-grid-labels`}
        type="symbol"
        filter={["==", "$type", "Point"]}
        layout={{
          "text-field": ["get", "label"],
          "text-size": 16,
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
