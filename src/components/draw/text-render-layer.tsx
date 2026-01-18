"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { GeoJSONStoreFeatures, TerraDraw } from "terra-draw";
import { useEffect, useState, useCallback } from "react";
import { Marker, MarkerEvent, MarkerDragEvent } from "react-map-gl/maplibre";

const DEFAULT_SOURCE = "terradraw";

// TerraDraw default coordinate precision
const COORDINATE_PRECISION = 8;

const roundCoordinate = (coord: number): number => {
  const factor = Math.pow(10, COORDINATE_PRECISION);
  return Math.round(coord * factor) / factor;
};

import {
  DEFAULT_TEXT_COLOR,
  DEFAULT_TEXT_SIZE,
  DEFAULT_TEXT_BOLD,
  DEFAULT_TEXT_ITALIC,
  DEFAULT_TEXT_UNDERLINE,
  DEFAULT_IS_HTML,
} from "@/lib/draw/getTextModeStyle";
import { SELECTION_COLOR } from "@/lib/draw/getSelectModeStyle";
import { DrawMode } from "@/hooks/store/drawState";

interface TextMarkerProps {
  feature: GeoJSONStoreFeatures;
  isSelected: boolean;
  drawMode: DrawMode;
  td: TerraDraw | null;
  mapId: MapId;
  onClick: (e: MarkerEvent<MouseEvent>) => void;
}

const TextMarker = ({
  feature,
  isSelected,
  drawMode,
  td,
  mapId,
  onClick,
}: TextMarkerProps) => {
  const featureId = feature.id;
  const setDraggingPosition = useStore((state) => state.setDraggingPosition);
  const [localPosition, setLocalPosition] = useState<[number, number] | null>(
    null,
  );

  const geometry = feature.geometry;

  const handleDragStart = useCallback(() => {
    if (geometry.type === "Point") {
      setLocalPosition([geometry.coordinates[0], geometry.coordinates[1]]);
    }
  }, [geometry]);

  const handleDrag = useCallback(
    (e: MarkerDragEvent) => {
      setLocalPosition([e.lngLat.lng, e.lngLat.lat]);
      // Share dragging position globally for button tracking
      if (featureId !== undefined) {
        setDraggingPosition({
          featureId,
          mapId,
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
        });
      }
    },
    [featureId, mapId, setDraggingPosition],
  );

  const handleDragEnd = useCallback(
    (e: MarkerDragEvent) => {
      if (td && featureId !== undefined) {
        td.updateFeatureGeometry(featureId, {
          type: "Point",
          coordinates: [
            roundCoordinate(e.lngLat.lng),
            roundCoordinate(e.lngLat.lat),
          ],
        });
      }
      setLocalPosition(null);
      setDraggingPosition(null);
    },
    [td, featureId, setDraggingPosition],
  );

  if (geometry.type !== "Point") {
    return null;
  }
  const [lng, lat] = localPosition ?? geometry.coordinates;

  const textColor =
    typeof feature.properties.textColor === "string"
      ? feature.properties.textColor
      : DEFAULT_TEXT_COLOR;
  const textSize =
    typeof feature.properties.textSize === "number"
      ? feature.properties.textSize
      : DEFAULT_TEXT_SIZE;
  const textBold =
    typeof feature.properties.textBold === "boolean"
      ? feature.properties.textBold
      : DEFAULT_TEXT_BOLD;
  const textItalic =
    typeof feature.properties.textItalic === "boolean"
      ? feature.properties.textItalic
      : DEFAULT_TEXT_ITALIC;
  const textUnderline =
    typeof feature.properties.textUnderline === "boolean"
      ? feature.properties.textUnderline
      : DEFAULT_TEXT_UNDERLINE;
  const isHtml =
    typeof feature.properties.isHtml === "boolean"
      ? feature.properties.isHtml
      : DEFAULT_IS_HTML;
  const textContent =
    typeof feature.properties.textContent === "string"
      ? feature.properties.textContent
      : "";

  // 空のテキストは表示しない
  if (!textContent) {
    return null;
  }

  const isDraggable = isSelected && drawMode === "select";

  const selectionStyle: React.CSSProperties = isSelected
    ? {
        boxShadow: `0 0 0 3px ${SELECTION_COLOR}`,
        borderRadius: "4px",
        padding: "2px 4px",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        cursor: isDraggable ? "move" : "pointer",
      }
    : {};

  return (
    <Marker
      longitude={lng}
      latitude={lat}
      anchor="center"
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onClick={onClick}
    >
      <div
        style={{
          color: textColor,
          fontSize: `${String(textSize)}px`,
          fontWeight: textBold ? "bold" : "normal",
          fontStyle: textItalic ? "italic" : "normal",
          textDecoration: textUnderline ? "underline" : "none",
          whiteSpace: "pre-wrap",
          pointerEvents: "none",
          textShadow:
            "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff",
          ...selectionStyle,
        }}
        {...(isHtml
          ? { dangerouslySetInnerHTML: { __html: textContent } }
          : { children: textContent })}
      />
    </Marker>
  );
};

export const TextRenderLayer = ({ mapId }: { mapId: MapId }) => {
  const td = useStore((state) => state.maps[mapId].td);
  const hiddenSources = useStore((state) => state.hiddenSources);
  const drawMode = useStore((state) => state.drawMode);
  const setSelectedFeature = useStore((state) => state.setSelectedFeature);
  const selectedFeature = useStore((state) => state.selectedFeature);
  const [textFeatures, setTextFeatures] = useState<GeoJSONStoreFeatures[]>([]);

  const handleMarkerClick = useCallback(
    (e: MarkerEvent<MouseEvent>, featureId: string | number) => {
      e.originalEvent.stopPropagation(); // TerraDraw へのイベント伝播を防止
      if (drawMode === "select" && td) {
        td.selectFeature(featureId);
        setSelectedFeature({ featureId, mapId });
      }
    },
    [drawMode, td, setSelectedFeature, mapId],
  );

  // TerraDraw のスナップショットを取得してテキストフィーチャーをフィルター
  const getTextFeatures = useCallback(() => {
    if (!td) return [];
    const snapshot = td.getSnapshot();
    return snapshot.filter((f) => {
      if (f.properties.mode !== "text") return false;

      // Check if this feature is hidden
      const rawMapId = f.properties.mapId;
      const featureMapId = typeof rawMapId === "string" ? rawMapId : mapId;
      const source =
        typeof f.properties.source === "string"
          ? f.properties.source
          : DEFAULT_SOURCE;
      const sourceKey = `${featureMapId}:${source}`;
      return !hiddenSources.has(sourceKey);
    });
  }, [td, mapId, hiddenSources]);

  useEffect(() => {
    if (!td) return;

    const updateFeatures = () => {
      setTextFeatures(getTextFeatures());
    };

    // change イベント（ジオメトリ変更）をリッスン
    td.on("change", updateFeatures);
    updateFeatures();

    // 定期的にスナップショットをポーリングしてプロパティ変更を検出
    const intervalId = setInterval(() => {
      const current = getTextFeatures();
      setTextFeatures((prev) => {
        // 配列の内容が変わっていれば更新
        if (JSON.stringify(prev) !== JSON.stringify(current)) {
          return current;
        }
        return prev;
      });
    }, 100);

    return () => {
      td.off("change", updateFeatures);
      clearInterval(intervalId);
    };
  }, [td, getTextFeatures]);

  return (
    <>
      {textFeatures.map((feature) => {
        const isSelected =
          selectedFeature?.featureId === feature.id &&
          selectedFeature?.mapId === mapId;
        return (
          <TextMarker
            key={feature.id}
            feature={feature}
            isSelected={isSelected}
            drawMode={drawMode}
            td={td}
            mapId={mapId}
            onClick={(e) => {
              if (feature.id !== undefined) {
                handleMarkerClick(e, feature.id);
              }
            }}
          />
        );
      })}
    </>
  );
};
