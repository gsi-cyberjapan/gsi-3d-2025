"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { useEffect, useCallback, useMemo } from "react";
import { Source, Layer, useMap } from "react-map-gl/maplibre";
import { circle } from "@turf/circle";

interface Props {
  mapId: MapId;
}

const buildEquidistantCirclesData = (
  center: { lng: number; lat: number },
  intervalMeters: number,
  count: number,
  unit: "m" | "km",
) => {
  const circleFeatures = [];
  const labelFeatures = [];

  for (let i = 1; i <= count; i++) {
    const radiusMeters = intervalMeters * i;
    const radiusKm = radiusMeters / 1000;

    const circlePolygon = circle([center.lng, center.lat], radiusKm, {
      steps: 128,
      units: "kilometers",
    });

    // Convert polygon to linestring for rendering as a ring
    const coords = circlePolygon.geometry.coordinates[0];
    circleFeatures.push({
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: coords as [number, number][],
      },
    });

    // Label at the top of the circle
    const labelValue =
      unit === "km"
        ? `${String(radiusMeters / 1000)}km`
        : `${String(radiusMeters)}m`;

    labelFeatures.push({
      type: "Feature" as const,
      properties: { label: labelValue },
      geometry: {
        type: "Point" as const,
        coordinates: coords[0] as [number, number],
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
    features: [...circleFeatures, ...labelFeatures],
  };
};

export const EquidistantCirclesController = ({ mapId }: Props) => {
  const map = useMap()[mapId]?.getMap();
  const isOpen = useStore((state) => state.isEquidistantCirclesWindowOpen);
  const center = useStore((state) => state.equidistantCirclesCenter);
  const setCenter = useStore((state) => state.setEquidistantCirclesCenter);
  const interval = useStore((state) => state.equidistantCirclesInterval);
  const count = useStore((state) => state.equidistantCirclesCount);
  const color = useStore((state) => state.equidistantCirclesColor);
  const lineWidth = useStore((state) => state.equidistantCirclesLineWidth);
  const lineDash = useStore((state) => state.equidistantCirclesLineDash);
  const unit = useStore((state) => state.equidistantCirclesUnit);

  const handleClick = useCallback(
    (e: maplibregl.MapMouseEvent) => {
      setCenter({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    },
    [setCenter],
  );

  // Subscribe to map click events when window is open
  useEffect(() => {
    if (!map || !isOpen) return;

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [map, isOpen, handleClick]);

  const geojsonData = useMemo(() => {
    if (!center || !isOpen) return null;
    return buildEquidistantCirclesData(center, interval, count, unit);
  }, [center, isOpen, interval, count, unit]);

  if (!geojsonData) return null;

  return (
    <Source
      id={`${mapId}-equidistant-circles`}
      type="geojson"
      data={geojsonData}
    >
      <Layer
        id={`${mapId}-equidistant-circles-lines`}
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
        id={`${mapId}-equidistant-circles-labels`}
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
