"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { GeoJSONStoreFeatures } from "terra-draw";
import { useEffect, useState, useCallback } from "react";
import { Marker } from "react-map-gl/maplibre";
import {
  DEFAULT_TEXT_COLOR,
  DEFAULT_TEXT_SIZE,
  DEFAULT_TEXT_BOLD,
  DEFAULT_TEXT_ITALIC,
  DEFAULT_TEXT_UNDERLINE,
  DEFAULT_IS_HTML,
} from "@/lib/draw/getTextModeStyle";

interface TextMarkerProps {
  feature: GeoJSONStoreFeatures;
}

const TextMarker = ({ feature }: TextMarkerProps) => {
  const geometry = feature.geometry;
  if (geometry.type !== "Point") {
    return null;
  }
  const [lng, lat] = geometry.coordinates;

  const textColor =
    typeof feature.properties.textColor === "string" ? feature.properties.textColor : DEFAULT_TEXT_COLOR;
  const textSize =
    typeof feature.properties.textSize === "number" ? feature.properties.textSize : DEFAULT_TEXT_SIZE;
  const textBold =
    typeof feature.properties.textBold === "boolean" ? feature.properties.textBold : DEFAULT_TEXT_BOLD;
  const textItalic =
    typeof feature.properties.textItalic === "boolean"
      ? feature.properties.textItalic
      : DEFAULT_TEXT_ITALIC;
  const textUnderline =
    typeof feature.properties.textUnderline === "boolean"
      ? feature.properties.textUnderline
      : DEFAULT_TEXT_UNDERLINE;
  const isHtml =
    typeof feature.properties.isHtml === "boolean" ? feature.properties.isHtml : DEFAULT_IS_HTML;
  const textContent =
    typeof feature.properties.textContent === "string" ? feature.properties.textContent : "";

  // 空のテキストは表示しない
  if (!textContent) {
    return null;
  }

  return (
    <Marker longitude={lng} latitude={lat} anchor="center">
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
  const [textFeatures, setTextFeatures] = useState<GeoJSONStoreFeatures[]>([]);

  // TerraDraw のスナップショットを取得してテキストフィーチャーをフィルター
  const getTextFeatures = useCallback(() => {
    if (!td) return [];
    const snapshot = td.getSnapshot();
    return snapshot.filter((f) => f.properties.mode === "text");
  }, [td]);

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
      {textFeatures.map((feature) => (
        <TextMarker key={feature.id} feature={feature} />
      ))}
    </>
  );
};
