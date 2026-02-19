"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import {
  getMagneticDeclination,
  isValidForMagneticDeclination,
} from "@/lib/magneticDeclination";
import { useMemo } from "react";
import { Source, Layer, useMap } from "react-map-gl/maplibre";

interface Props {
  mapId: MapId;
}

const MIN_ZOOM_LEVEL = 10;
const LINE_COUNT = 3;

const formatDeclination = (declinationDeg: number): string => {
  const direction = declinationDeg < 0 ? "西偏" : "東偏";
  const absDeg = Math.abs(declinationDeg);
  let degrees = Math.floor(absDeg);
  let minutes = Math.round(((absDeg - degrees) * 60) / 10) * 10;
  if (minutes === 60) {
    degrees += 1;
    minutes = 0;
  }
  return `${direction} ${String(degrees)}°${String(minutes)}'`;
};

const buildMagneticNorthLines = (map: maplibregl.Map) => {
  if (map.getZoom() < MIN_ZOOM_LEVEL) return null;

  const center = map.getCenter();
  if (!isValidForMagneticDeclination(center.lat, center.lng)) {
    return null;
  }

  const declination = getMagneticDeclination(center.lat, center.lng);
  if (declination === null) return null;
  const bearing = map.getBearing();
  const angleRad = ((declination - bearing) * Math.PI) / 180;

  const label = formatDeclination(declination);

  const canvas = map.getCanvas();
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const diagonal = Math.sqrt(width * width + height * height);
  const centerX = width / 2;
  const centerY = height / 2;

  const lineSpacing = width / LINE_COUNT;

  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);

  const features = [];
  const half = Math.floor(LINE_COUNT / 2);

  for (let i = -half; i <= half; i++) {
    const offsetX = i * lineSpacing * cosA;
    const offsetY = i * lineSpacing * sinA;

    const x1 = centerX + offsetX + diagonal * sinA;
    const y1 = centerY + offsetY - diagonal * cosA;
    const x2 = centerX + offsetX - diagonal * sinA;
    const y2 = centerY + offsetY + diagonal * cosA;

    const start = map.unproject([x1, y1]);
    const end = map.unproject([x2, y2]);

    features.push({
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [start.lng, start.lat] as [number, number],
          [end.lng, end.lat] as [number, number],
        ],
      },
    });

    if (i === 0) {
      const labelOffset = 40;
      const labelX = centerX + labelOffset * sinA;
      const labelY = centerY - labelOffset * cosA;
      const point = map.unproject([labelX, labelY]);
      features.push({
        type: "Feature" as const,
        properties: {
          label,
          rotation: declination,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [point.lng, point.lat] as [number, number],
        },
      });
    }
  }

  return {
    type: "FeatureCollection" as const,
    features,
  };
};

export const MagneticNorthController = ({ mapId }: Props) => {
  const map = useMap()[mapId]?.getMap();
  const isDisplayMagneticNorth = useStore(
    (state) => state.isDisplayMagneticNorth,
  );
  const viewState = useStore((state) => state.viewStates[mapId]);

  const geojsonData = useMemo(() => {
    if (!map || !isDisplayMagneticNorth || !viewState) return null;
    return buildMagneticNorthLines(map);
  }, [map, isDisplayMagneticNorth, viewState]);

  if (!geojsonData) return null;

  return (
    <Source id={`${mapId}-magnetic-north`} type="geojson" data={geojsonData}>
      <Layer
        id={`${mapId}-magnetic-north-lines`}
        type="line"
        filter={["==", "$type", "LineString"]}
        paint={{
          "line-color": "#ff0000",
          "line-width": 1,
          "line-opacity": 0.8,
        }}
      />
      <Layer
        id={`${mapId}-magnetic-north-labels`}
        type="symbol"
        filter={["==", "$type", "Point"]}
        layout={{
          "text-field": ["get", "label"],
          "text-size": 10,
          "text-rotate": ["get", "rotation"],
          "text-allow-overlap": true,
          "text-rotation-alignment": "map",
          "text-padding": 0,
        }}
        paint={{
          "text-color": "#ff0000",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1,
        }}
      />
    </Source>
  );
};
