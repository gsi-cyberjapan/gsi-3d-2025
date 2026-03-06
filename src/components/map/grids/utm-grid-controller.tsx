"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import {
  lngToUtmZone,
  getUtmLatBand,
  getUtmGridIntervalMeters,
  latLngToUtm,
  utmToLatLng,
  getUtmGridLabel,
  getIntermediateStepMeters,
} from "@/lib/grids/utmGrid";
import { useMemo } from "react";
import { Source, Layer, useMap } from "react-map-gl/maplibre";

interface Props {
  mapId: MapId;
}

type GridFeature = {
  type: "Feature";
  properties: { label?: string };
  geometry:
    | { type: "LineString"; coordinates: [number, number][] }
    | { type: "Point"; coordinates: [number, number] };
};

const buildUtmZoneGridData = (map: maplibregl.Map) => {
  const bounds = map.getBounds();
  const south = Math.max(bounds.getSouth(), -80);
  const north = Math.min(bounds.getNorth(), 84);
  const west = bounds.getWest();
  const east = bounds.getEast();

  const features: GridFeature[] = [];

  // 6° zone boundaries (vertical lines)
  const startZoneLng = Math.floor(west / 6) * 6;
  for (let lng = startZoneLng; lng <= east; lng += 6) {
    features.push({
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
    features.push({
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

      features.push({
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
    features,
  };
};

const buildUtmSubGridData = (map: maplibregl.Map, intervalMeters: number) => {
  const bounds = map.getBounds();
  const south = Math.max(bounds.getSouth(), -80);
  const north = Math.min(bounds.getNorth(), 84);
  const west = bounds.getWest();
  const east = bounds.getEast();

  const features: GridFeature[] = [];

  const step = getIntermediateStepMeters(intervalMeters);

  // Process each UTM zone visible in viewport
  const startZoneLng = Math.floor(west / 6) * 6;
  for (let zoneLng = startZoneLng; zoneLng < east; zoneLng += 6) {
    const zoneWest = Math.max(zoneLng, west);
    const zoneEast = Math.min(zoneLng + 6, east);
    const zoneCenterLng = zoneLng + 3;
    const zone = lngToUtmZone(zoneCenterLng);

    // Process north and south hemispheres separately
    const hemispheres: { hSouth: number; hNorth: number; southern: boolean }[] =
      [];
    if (south < 0 && north > 0) {
      hemispheres.push({ hSouth: south, hNorth: 0, southern: true });
      hemispheres.push({ hSouth: 0, hNorth: north, southern: false });
    } else if (south < 0) {
      hemispheres.push({ hSouth: south, hNorth: north, southern: true });
    } else {
      hemispheres.push({ hSouth: south, hNorth: north, southern: false });
    }

    for (const { hSouth, hNorth, southern } of hemispheres) {
      // Convert viewport corners to UTM for this zone/hemisphere
      const corners = [
        latLngToUtm(zoneWest, hSouth, zone),
        latLngToUtm(zoneEast, hSouth, zone),
        latLngToUtm(zoneWest, hNorth, zone),
        latLngToUtm(zoneEast, hNorth, zone),
      ];

      const minE =
        Math.floor(
          Math.min(...corners.map((c) => c.easting)) / intervalMeters,
        ) * intervalMeters;
      const maxE =
        Math.ceil(Math.max(...corners.map((c) => c.easting)) / intervalMeters) *
        intervalMeters;
      const minN =
        Math.floor(
          Math.min(...corners.map((c) => c.northing)) / intervalMeters,
        ) * intervalMeters;
      const maxN =
        Math.ceil(
          Math.max(...corners.map((c) => c.northing)) / intervalMeters,
        ) * intervalMeters;

      // Vertical lines (constant easting)
      for (let e = minE; e <= maxE; e += intervalMeters) {
        const coords: [number, number][] = [];
        for (let n = minN; n <= maxN; n += step) {
          const { lng, lat } = utmToLatLng(e, n, zone, southern);
          // Clip to zone boundary and latitude bounds
          if (lng < zoneLng || lng > zoneLng + 6) continue;
          if (lat < hSouth || lat > hNorth) continue;
          coords.push([lng, lat]);
        }
        if (coords.length >= 2) {
          features.push({
            type: "Feature" as const,
            properties: {},
            geometry: {
              type: "LineString" as const,
              coordinates: coords,
            },
          });
        }
      }

      // Horizontal lines (constant northing)
      for (let n = minN; n <= maxN; n += intervalMeters) {
        const coords: [number, number][] = [];
        for (let e = minE; e <= maxE; e += step) {
          const { lng, lat } = utmToLatLng(e, n, zone, southern);
          if (lng < zoneLng || lng > zoneLng + 6) continue;
          if (lat < hSouth || lat > hNorth) continue;
          coords.push([lng, lat]);
        }
        if (coords.length >= 2) {
          features.push({
            type: "Feature" as const,
            properties: {},
            geometry: {
              type: "LineString" as const,
              coordinates: coords,
            },
          });
        }
      }

      // Labels at grid intersections
      for (let e = minE; e <= maxE; e += intervalMeters) {
        for (let n = minN; n <= maxN; n += intervalMeters) {
          const { lng, lat } = utmToLatLng(e, n, zone, southern);
          if (lng < zoneWest || lng > zoneEast) continue;
          if (lat < hSouth || lat > hNorth) continue;
          const label = getUtmGridLabel(lng, lat, intervalMeters);
          if (label) {
            features.push({
              type: "Feature" as const,
              properties: { label },
              geometry: {
                type: "Point" as const,
                coordinates: [lng, lat] as [number, number],
              },
            });
          }
        }
      }
    }
  }

  return {
    type: "FeatureCollection" as const,
    features,
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

  const subGridData = useMemo(() => {
    if (!map || !isDisplayUtmGrid || !viewState) return null;
    const zoom = Math.floor(viewState.zoom);
    const interval = getUtmGridIntervalMeters(zoom);
    if (interval === 0) return null;
    return buildUtmSubGridData(map, interval);
  }, [map, isDisplayUtmGrid, viewState]);

  if (!geojsonData) return null;

  return (
    <>
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
      {subGridData && (
        <Source id={`${mapId}-utm-subgrid`} type="geojson" data={subGridData}>
          <Layer
            id={`${mapId}-utm-subgrid-lines`}
            type="line"
            filter={["==", "$type", "LineString"]}
            paint={{
              "line-color": "#FF0000",
              "line-width": 2,
              "line-opacity": 1,
              "line-dasharray": [3, 3],
            }}
          />
          <Layer
            id={`${mapId}-utm-subgrid-labels`}
            type="symbol"
            filter={["==", "$type", "Point"]}
            layout={{
              "text-field": ["get", "label"],
              "text-size": 12,
              "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
              "text-anchor": "bottom-left",
              "text-allow-overlap": true,
              "text-offset": [0.3, -0.3],
            }}
            paint={{
              "text-color": "#FF0000",
              "text-halo-color": "#ffffff",
              "text-halo-width": 2,
            }}
          />
        </Source>
      )}
    </>
  );
};
