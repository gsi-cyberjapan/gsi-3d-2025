"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { GeoJSONStoreFeatures, TerraDraw } from "terra-draw";
import { useEffect, useState, useCallback } from "react";
import { Marker, MarkerEvent, MarkerDragEvent } from "react-map-gl/maplibre";
import {
  getMarkerIconUrl,
  getMarkerSizePixels,
} from "@/lib/draw/getPointModeStyle";
import { SELECTION_COLOR } from "@/lib/draw/getSelectModeStyle";
import { DrawMode } from "@/hooks/store/drawState";
import { DRAW_CONFIG } from "@/lib/config";

const DEFAULT_SOURCE = "terradraw";

// TerraDraw default coordinate precision
const COORDINATE_PRECISION = 8;

const roundCoordinate = (coord: number): number => {
  const factor = Math.pow(10, COORDINATE_PRECISION);
  return Math.round(coord * factor) / factor;
};

interface IconMarkerProps {
  feature: GeoJSONStoreFeatures;
  isSelected: boolean;
  drawMode: DrawMode;
  td: TerraDraw | null;
  mapId: MapId;
  onClick: (e: MarkerEvent<MouseEvent>) => void;
}

type MarkerSize = keyof typeof DRAW_CONFIG.MARKER.SIZES;

const IconMarker = ({
  feature,
  isSelected,
  drawMode,
  td,
  mapId,
  onClick,
}: IconMarkerProps) => {
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

  const markerSymbol =
    typeof feature.properties["marker-symbol"] === "string"
      ? feature.properties["marker-symbol"]
      : DRAW_CONFIG.MARKER.DEFAULT_ICON;
  const rawMarkerSize = feature.properties["marker-size"];
  const markerSize =
    typeof rawMarkerSize === "string" &&
    ["small", "medium", "large"].includes(rawMarkerSize)
      ? (rawMarkerSize as MarkerSize)
      : DRAW_CONFIG.MARKER.DEFAULT_SIZE;

  const iconUrl = getMarkerIconUrl(markerSymbol);
  const sizePixels = getMarkerSizePixels(markerSize);

  const isDraggable = isSelected && drawMode === "select";

  const containerStyle: React.CSSProperties = isSelected
    ? {
        boxShadow: `0 0 0 3px ${SELECTION_COLOR}`,
        borderRadius: "4px",
        padding: "2px",
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
      <div style={containerStyle}>
        <img
          src={iconUrl}
          alt=""
          width={sizePixels}
          height={sizePixels}
          style={{
            pointerEvents: "none",
            display: "block",
          }}
        />
      </div>
    </Marker>
  );
};

export const IconRenderLayer = ({ mapId }: { mapId: MapId }) => {
  const td = useStore((state) => state.maps[mapId].td);
  const hiddenSources = useStore((state) => state.hiddenSources);
  const drawMode = useStore((state) => state.drawMode);
  const setSelectedFeature = useStore((state) => state.setSelectedFeature);
  const selectedFeature = useStore((state) => state.selectedFeature);
  const [pointFeatures, setPointFeatures] = useState<GeoJSONStoreFeatures[]>(
    [],
  );

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

  // TerraDraw のスナップショットを取得してポイントフィーチャーをフィルター
  const getPointFeatures = useCallback(() => {
    if (!td) return [];
    const snapshot = td.getSnapshot();
    return snapshot.filter((f) => {
      if (f.properties.mode !== "point") return false;

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
      setPointFeatures(getPointFeatures());
    };

    // change イベント（ジオメトリ変更）をリッスン
    td.on("change", updateFeatures);
    updateFeatures();

    // 定期的にスナップショットをポーリングしてプロパティ変更を検出
    const intervalId = setInterval(() => {
      const current = getPointFeatures();
      setPointFeatures((prev) => {
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
  }, [td, getPointFeatures]);

  return (
    <>
      {pointFeatures.map((feature) => {
        const isSelected =
          selectedFeature?.featureId === feature.id &&
          selectedFeature?.mapId === mapId;
        return (
          <IconMarker
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
