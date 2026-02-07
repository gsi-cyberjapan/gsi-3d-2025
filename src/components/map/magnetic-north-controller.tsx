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

const LINE_SPACING_PX = 40;
const LABEL_SPACING_PX = 200;
const LABEL_LINE_INTERVAL = 5;

const buildMagneticNorthLines = (map: maplibregl.Map) => {
  const center = map.getCenter();
  if (!isValidForMagneticDeclination(center.lat, center.lng)) {
    return null;
  }

  const declination = getMagneticDeclination(center.lat, center.lng);
  const angleRad = (declination * Math.PI) / 180;

  const direction = declination < 0 ? "西偏" : "東偏";
  const label = `${direction} ${String(Math.abs(Math.round(declination * 10) / 10))}°`;
  const rotation = declination;

  const canvas = map.getCanvas();
  const width = canvas.width;
  const height = canvas.height;
  const diagonal = Math.sqrt(width * width + height * height);
  const centerX = width / 2;
  const centerY = height / 2;

  const lineCount = Math.ceil(diagonal / LINE_SPACING_PX) + 1;

  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);

  const features = [];

  for (let i = -lineCount; i <= lineCount; i++) {
    const offsetX = i * LINE_SPACING_PX * cosA;
    const offsetY = i * LINE_SPACING_PX * sinA;

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

    if (i % LABEL_LINE_INTERVAL === 0) {
      const lineLength = 2 * diagonal;
      const labelCount = Math.floor(lineLength / LABEL_SPACING_PX);
      for (let j = 1; j <= labelCount; j++) {
        const t = j / (labelCount + 1);
        const px = x1 + (x2 - x1) * t;
        const py = y1 + (y2 - y1) * t;
        const point = map.unproject([px, py]);
        features.push({
          type: "Feature" as const,
          properties: { label, rotation },
          geometry: {
            type: "Point" as const,
            coordinates: [point.lng, point.lat] as [number, number],
          },
        });
      }
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
