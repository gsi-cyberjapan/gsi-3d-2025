"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { GeoJSONStoreFeatures } from "terra-draw";
import { useEffect, useState, useCallback } from "react";
import { Marker } from "react-map-gl/maplibre";
import {
  DEFAULT_MARKER_SYMBOL,
  DEFAULT_MARKER_SIZE,
  getMarkerIconUrl,
  getMarkerSizePixels,
} from "@/lib/draw/getPointModeStyle";
import { MarkerSize } from "@/lib/config";

const DEFAULT_SOURCE = "terradraw";

interface IconMarkerProps {
  feature: GeoJSONStoreFeatures;
}

const IconMarker = ({ feature }: IconMarkerProps) => {
  const geometry = feature.geometry;
  if (geometry.type !== "Point") {
    return null;
  }
  const [lng, lat] = geometry.coordinates;

  const markerSymbol =
    typeof feature.properties["marker-symbol"] === "string"
      ? feature.properties["marker-symbol"]
      : DEFAULT_MARKER_SYMBOL;
  const rawMarkerSize = feature.properties["marker-size"];
  const markerSize =
    typeof rawMarkerSize === "string" &&
    ["small", "medium", "large"].includes(rawMarkerSize)
      ? (rawMarkerSize as MarkerSize)
      : DEFAULT_MARKER_SIZE;

  const iconUrl = getMarkerIconUrl(markerSymbol);
  const sizePixels = getMarkerSizePixels(markerSize);

  return (
    <Marker longitude={lng} latitude={lat} anchor="center">
      <img
        src={iconUrl}
        alt=""
        width={sizePixels}
        height={sizePixels}
        style={{
          pointerEvents: "none",
        }}
      />
    </Marker>
  );
};

export const IconRenderLayer = ({ mapId }: { mapId: MapId }) => {
  const td = useStore((state) => state.maps[mapId].td);
  const hiddenSources = useStore((state) => state.hiddenSources);
  const [pointFeatures, setPointFeatures] = useState<GeoJSONStoreFeatures[]>(
    [],
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
      {pointFeatures.map((feature) => (
        <IconMarker key={feature.id} feature={feature} />
      ))}
    </>
  );
};
