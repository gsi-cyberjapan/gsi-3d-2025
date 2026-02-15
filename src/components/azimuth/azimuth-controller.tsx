"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { useEffect, useCallback, useMemo } from "react";
import { Source, Layer, useMap } from "react-map-gl/maplibre";
import destination from "@turf/destination";

interface Props {
  mapId: MapId;
}

const BEARING_LABELS: Record<number, string> = {
  0: "N",
  45: "NE",
  90: "E",
  135: "SE",
  180: "S",
  225: "SW",
  270: "W",
  315: "NW",
};

const buildAzimuthData = (
  center: { lng: number; lat: number },
  distanceMeters: number,
  intervalDegrees: number,
) => {
  const lineFeatures = [];
  const labelFeatures = [];
  const distanceKm = distanceMeters / 1000;
  const steps = 64;

  for (let bearing = 0; bearing < 360; bearing += intervalDegrees) {
    const coords: [number, number][] = [[center.lng, center.lat]];

    for (let i = 1; i <= steps; i++) {
      const d = (distanceKm * i) / steps;
      const pt = destination([center.lng, center.lat], d, bearing, {
        units: "kilometers",
      });
      coords.push(pt.geometry.coordinates as [number, number]);
    }

    lineFeatures.push({
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: coords,
      },
    });

    // Label at the end of the line
    const label =
      bearing in BEARING_LABELS
        ? BEARING_LABELS[bearing]
        : `${String(bearing)}°`;
    const endPt = coords[coords.length - 1];
    labelFeatures.push({
      type: "Feature" as const,
      properties: { label },
      geometry: {
        type: "Point" as const,
        coordinates: endPt,
      },
    });
  }

  // Center point marker
  labelFeatures.push({
    type: "Feature" as const,
    properties: { label: "" },
    geometry: {
      type: "Point" as const,
      coordinates: [center.lng, center.lat] as [number, number],
    },
  });

  return {
    type: "FeatureCollection" as const,
    features: [...lineFeatures, ...labelFeatures],
  };
};

export const AzimuthController = ({ mapId }: Props) => {
  const map = useMap()[mapId]?.getMap();
  const isOpen = useStore((state) => state.isAzimuthWindowOpen);
  const center = useStore((state) => state.azimuthCenter);
  const setCenter = useStore((state) => state.setAzimuthCenter);
  const distance = useStore((state) => state.azimuthDistance);
  const interval = useStore((state) => state.azimuthInterval);
  const color = useStore((state) => state.azimuthColor);
  const lineWidth = useStore((state) => state.azimuthLineWidth);
  const lineDash = useStore((state) => state.azimuthLineDash);

  const handleClick = useCallback(
    (e: maplibregl.MapMouseEvent) => {
      setCenter({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    },
    [setCenter],
  );

  useEffect(() => {
    if (!map || !isOpen) return;

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [map, isOpen, handleClick]);

  const geojsonData = useMemo(() => {
    if (!center || !isOpen) return null;
    return buildAzimuthData(center, distance, interval);
  }, [center, isOpen, distance, interval]);

  if (!geojsonData) return null;

  return (
    <Source id={`${mapId}-azimuth`} type="geojson" data={geojsonData}>
      <Layer
        id={`${mapId}-azimuth-lines`}
        type="line"
        filter={["==", "$type", "LineString"]}
        paint={{
          "line-color": color,
          "line-width": lineWidth,
          "line-opacity": 1,
          ...(lineDash.length > 0 ? { "line-dasharray": lineDash } : {}),
        }}
      />
      <Layer
        id={`${mapId}-azimuth-labels`}
        type="symbol"
        filter={["==", "$type", "Point"]}
        layout={{
          "text-field": ["get", "label"],
          "text-size": 12,
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-anchor": "bottom",
          "text-allow-overlap": true,
        }}
        paint={{
          "text-color": color,
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
        }}
      />
    </Source>
  );
};
