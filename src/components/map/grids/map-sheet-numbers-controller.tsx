"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { useMemo } from "react";
import { Source, Layer, useMap } from "react-map-gl/maplibre";

interface Props {
  mapId: MapId;
}

/**
 * 図郭番号コントローラー
 * GSIのGeoJSONタイルから図郭境界と名称を表示
 */
export const MapSheetNumbersController = ({ mapId }: Props) => {
  const map = useMap()[mapId]?.getMap();
  const isDisplayMapSheetNumbers = useStore(
    (state) => state.isDisplayMapSheetNumbers,
  );
  const viewState = useStore((state) => state.viewStates[mapId]);

  const zoom = viewState ? Math.floor(viewState.zoom) : 0;

  // Select appropriate sheet scale based on zoom level
  const sheetConfig = useMemo(() => {
    if (zoom >= 11) {
      return {
        url: "https://cyberjapandata.gsi.go.jp/xyz/zk25000/{z}/{x}/{y}.geojson",
        minzoom: 11,
        maxzoom: 18,
        color: "#3388FF",
      };
    }
    if (zoom >= 9) {
      return {
        url: "https://maps.gsi.go.jp/xyz/zk50000/{z}/{x}/{y}.geojson",
        minzoom: 9,
        maxzoom: 10,
        color: "#3388FF",
      };
    }
    if (zoom >= 5) {
      return {
        url: "https://maps.gsi.go.jp/xyz/zk200000/{z}/{x}/{y}.geojson",
        minzoom: 5,
        maxzoom: 8,
        color: "#E14900",
      };
    }
    return null;
  }, [zoom]);

  if (!map || !isDisplayMapSheetNumbers || !sheetConfig) return null;

  return (
    <Source
      key={sheetConfig.url}
      id={`${mapId}-map-sheets`}
      type="geojson"
      data={sheetConfig.url}
    >
      <Layer
        id={`${mapId}-map-sheets-lines`}
        type="line"
        filter={["==", "$type", "Polygon"]}
        paint={{
          "line-color": sheetConfig.color,
          "line-width": 2,
          "line-opacity": 0.9,
          "line-dasharray": [2, 2],
        }}
      />
      <Layer
        id={`${mapId}-map-sheets-labels`}
        type="symbol"
        filter={["==", "$type", "Point"]}
        layout={{
          "text-field": ["get", "name"],
          "text-size": 14,
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-anchor": "center",
          "text-allow-overlap": true,
        }}
        paint={{
          "text-color": sheetConfig.color,
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
        }}
      />
    </Source>
  );
};
