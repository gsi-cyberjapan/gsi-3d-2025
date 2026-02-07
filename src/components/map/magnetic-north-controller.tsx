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

const buildMagneticNorthLines = (map: maplibregl.Map) => {
  const center = map.getCenter();
  if (!isValidForMagneticDeclination(center.lat, center.lng)) {
    return null;
  }

  const declination = getMagneticDeclination(center.lat, center.lng);
  const angleRad = (declination * Math.PI) / 180;

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
        paint={{
          "line-color": "#ff0000",
          "line-width": 1,
          "line-opacity": 0.8,
        }}
      />
    </Source>
  );
};
