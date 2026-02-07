"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { latToTileY, lngToTileX } from "@/lib/grids/tileGrid";
import { useEffect, useMemo, useRef, useState } from "react";
import { Source, Layer, useMap } from "react-map-gl/maplibre";

interface Props {
  mapId: MapId;
}

interface SheetConfig {
  urlTemplate: string;
  tileZoom: number;
  color: string;
}

type FeatureCollection = {
  type: "FeatureCollection";
  features: Feature[];
};

type Feature = {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry:
    | { type: "Polygon"; coordinates: [number, number][][] }
    | { type: "Point"; coordinates: [number, number] };
};

/**
 * Get sheet config based on the current display zoom
 */
const getSheetConfig = (zoom: number): SheetConfig | null => {
  if (zoom >= 12) {
    return {
      urlTemplate:
        "https://cyberjapandata.gsi.go.jp/xyz/zk25000/{z}/{x}/{y}.geojson",
      tileZoom: 8,
      color: "#3388FF",
    };
  }
  if (zoom >= 9) {
    return {
      urlTemplate: "https://maps.gsi.go.jp/xyz/zk50000/{z}/{x}/{y}.geojson",
      tileZoom: 8,
      color: "#3388FF",
    };
  }
  if (zoom >= 5) {
    return {
      urlTemplate: "https://maps.gsi.go.jp/xyz/zk200000/{z}/{x}/{y}.geojson",
      tileZoom: zoom,
      color: "#E14900",
    };
  }
  return null;
};

/** Module-level tile cache: url → FeatureCollection */
const tileCache = new Map<string, FeatureCollection>();

const fetchTile = async (url: string): Promise<FeatureCollection | null> => {
  const cached = tileCache.get(url);
  if (cached) return cached;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as FeatureCollection;
    tileCache.set(url, data);
    return data;
  } catch {
    return null;
  }
};

/**
 * Convert zk25000 Point features (with 図郭座標) to Polygon + label Point features.
 * For zk50000/zk200000, features are already Polygons — just add label Points.
 */
const normalizeFeatures = (
  features: Feature[],
  isZk25000: boolean,
): Feature[] => {
  const result: Feature[] = [];

  for (const feature of features) {
    if (isZk25000 && feature.geometry.type === "Point") {
      // zk25000: Point with 図郭座標 → Polygon
      const coords = feature.properties["図郭座標"] as
        | [[number, number], [number, number]]
        | undefined;
      const name = (feature.properties["図名"] as string | undefined) ?? "";

      if (!coords) continue;

      const [sw, ne] = coords;
      const [west, south] = sw;
      const [east, north] = ne;

      // Polygon feature
      result.push({
        type: "Feature" as const,
        properties: { name },
        geometry: {
          type: "Polygon" as const,
          coordinates: [
            [
              [west, south],
              [east, south],
              [east, north],
              [west, north],
              [west, south],
            ],
          ],
        },
      });

      // Label Point at center
      result.push({
        type: "Feature" as const,
        properties: { name },
        geometry: {
          type: "Point" as const,
          coordinates: [(west + east) / 2, (south + north) / 2],
        },
      });
    } else if (feature.geometry.type === "Polygon") {
      // zk50000/zk200000: Polygon — keep as-is
      const name = (feature.properties["name"] as string | undefined) ?? "";

      result.push({
        type: "Feature" as const,
        properties: { name },
        geometry: feature.geometry,
      });

      // Label Point at polygon centroid (simple bbox center)
      const coords = feature.geometry.coordinates[0];
      let minLng = Infinity;
      let maxLng = -Infinity;
      let minLat = Infinity;
      let maxLat = -Infinity;
      for (const [lng, lat] of coords) {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }

      result.push({
        type: "Feature" as const,
        properties: { name },
        geometry: {
          type: "Point" as const,
          coordinates: [(minLng + maxLng) / 2, (minLat + maxLat) / 2],
        },
      });
    }
  }

  return result;
};

/**
 * 図郭番号コントローラー
 * GSIのGeoJSONタイルをfetchしてマージし、図郭境界と名称を表示
 */
export const MapSheetNumbersController = ({ mapId }: Props) => {
  const map = useMap()[mapId]?.getMap();
  const isDisplayMapSheetNumbers = useStore(
    (state) => state.isDisplayMapSheetNumbers,
  );
  const viewState = useStore((state) => state.viewStates[mapId]);
  const [geojsonData, setGeojsonData] = useState<FeatureCollection | null>(
    null,
  );
  const abortRef = useRef(0);

  const zoom = viewState ? Math.floor(viewState.zoom) : 0;
  const config = useMemo(() => getSheetConfig(zoom), [zoom]);

  useEffect(() => {
    if (!map || !config || !isDisplayMapSheetNumbers) return;

    const fetchId = ++abortRef.current;
    const bounds = map.getBounds();
    const tileZoom = config.tileZoom;

    const minX = lngToTileX(bounds.getWest(), tileZoom);
    const maxX = lngToTileX(bounds.getEast(), tileZoom);
    const minY = latToTileY(bounds.getNorth(), tileZoom);
    const maxY = latToTileY(bounds.getSouth(), tileZoom);

    const urls: string[] = [];
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        urls.push(
          config.urlTemplate
            .replace("{z}", String(tileZoom))
            .replace("{x}", String(x))
            .replace("{y}", String(y)),
        );
      }
    }

    const isZk25000 = config.urlTemplate.includes("zk25000");

    void Promise.all(urls.map(fetchTile)).then((tiles) => {
      if (abortRef.current !== fetchId) return;

      const allFeatures: Feature[] = [];
      for (const tile of tiles) {
        if (!tile) continue;
        allFeatures.push(...normalizeFeatures(tile.features, isZk25000));
      }

      setGeojsonData({
        type: "FeatureCollection" as const,
        features: allFeatures,
      });
    });
  }, [map, config, isDisplayMapSheetNumbers, viewState]);

  if (!geojsonData || !config) return null;

  return (
    <Source id={`${mapId}-map-sheets`} type="geojson" data={geojsonData}>
      <Layer
        id={`${mapId}-map-sheets-lines`}
        type="line"
        filter={["==", "$type", "Polygon"]}
        paint={{
          "line-color": config.color,
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
          "text-color": config.color,
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
        }}
      />
    </Source>
  );
};
