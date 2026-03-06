"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/maplibre";
import type { IControl } from "maplibre-gl";
import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { DENSHI_KOKUDO_3D_CONFIG } from "@/lib/config";

interface Props {
  mapId: MapId;
}

interface GeoJsonFeature {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: {
    type: "LineString";
    coordinates: number[][];
  };
}

interface GeoJsonData {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

// Module-level GeoJSON caches to avoid re-fetching large files
let railsPromise: Promise<GeoJsonData> | null = null;
let roadsPromise: Promise<GeoJsonData> | null = null;

const fetchGeoJson = (url: string): Promise<GeoJsonData> =>
  fetch(url).then((res) => res.json() as Promise<GeoJsonData>);

const addHeightToCoordinates = (
  data: GeoJsonData,
  height: number,
): GeoJsonData => ({
  type: "FeatureCollection" as const,
  features: data.features.map((f) => ({
    type: "Feature" as const,
    properties: f.properties,
    geometry: {
      type: "LineString" as const,
      coordinates: f.geometry.coordinates.map((coord) => [
        coord[0],
        coord[1],
        (coord[2] ?? 0) + height,
      ]),
    },
  })),
});

const getRailLineWidth = (f: { properties: Record<string, unknown> }) => {
  const ft = Number(f.properties.ftCode);
  if (ft === 2801 || ft === 2803) return 3;
  if (ft === 2802 || ft === 2804 || ft === 2806) return 3;
  if (ft === 2811 || ft === 2813 || ft === 2814) return 1;
  if (ft === 2821 || ft === 2831 || ft === 2841 || ft === 2843) return 1;
  return 1;
};

type Color = [number, number, number, number];

const getRailLineColor = (f: {
  properties: Record<string, unknown>;
}): Color => {
  const ft = Number(f.properties.ftCode);
  if (ft === 2801 || ft === 2803) return [100, 0, 0, 255];
  if (ft === 2802 || ft === 2804 || ft === 2806) return [100, 0, 0, 255];
  if (ft === 2811 || ft === 2813 || ft === 2814) return [100, 100, 100, 255];
  if (ft === 2821 || ft === 2831 || ft === 2841 || ft === 2843)
    return [100, 100, 100, 255];
  return [200, 200, 200, 255];
};

const ROAD_COLORS = {
  national: [235, 122, 122, 255] as Color,
  prefect: [255, 255, 0, 255] as Color,
  municipal: [255, 255, 255, 255] as Color,
  highway: [100, 195, 115, 255] as Color,
  footpath: [173, 173, 173, 255] as Color,
  gray: [100, 100, 100, 255] as Color,
  snow: [200, 200, 200, 255] as Color,
};

const getRoadBaseWidth = (f: {
  properties: Record<string, unknown>;
}): number => {
  const p = f.properties;
  if (p.Width !== null && p.Width !== undefined && Number(p.Width) !== 0)
    return Number(p.Width);
  if (typeof p.rnkWidth === "string") {
    const rnk = p.rnkWidth;
    if (rnk === "3m未満") return 3;
    if (rnk === "3m-5.5m未満") return 4.5;
    if (rnk === "5.5m-13m未満") return 9;
    if (rnk === "13m-19.5m未満") return 18;
    if (rnk === "19.5m以上") return 27;
    return 1;
  }
  return 30;
};

const getRoadCasingWidth = (f: {
  properties: Record<string, unknown>;
}): number =>
  getRoadBaseWidth(f) + DENSHI_KOKUDO_3D_CONFIG.ROAD_CASING_WIDTH_OFFSET;

const getRoadInnerWidth = (f: {
  properties: Record<string, unknown>;
}): number =>
  Math.max(
    0.1,
    getRoadBaseWidth(f) - DENSHI_KOKUDO_3D_CONFIG.ROAD_CASING_WIDTH_OFFSET,
  );

const getRoadLineColor = (f: {
  properties: Record<string, unknown>;
}): Color => {
  const p = f.properties;
  const ft = Number(p.ftCode);
  const rd = typeof p.rdCtg === "string" ? p.rdCtg : "";
  const rnk = typeof p.rnkWidth === "string" ? p.rnkWidth : "";
  const w = p.Width != null ? Number(p.Width) : null;

  let base: Color = ROAD_COLORS.gray;
  let cat = "unknown";
  if (rd.includes("高速")) {
    base = ROAD_COLORS.highway;
    cat = "highway";
  } else if (rd.includes("国道")) {
    base = ROAD_COLORS.national;
    cat = "national";
  } else if (rd.includes("都道府県")) {
    base = ROAD_COLORS.prefect;
    cat = "prefect";
  } else if (rd.includes("市区町村")) {
    base = ROAD_COLORS.municipal;
    cat = "municipal";
  } else if (rd.includes("雪")) {
    base = ROAD_COLORS.snow;
    cat = "snow";
  }

  if (ft === 2721 || ft === 2722 || ft === 2723) {
    return rd.includes("国道") ? ROAD_COLORS.gray : ROAD_COLORS.footpath;
  }
  if (ft === 2731 || ft === 2732 || ft === 2733 || ft === 2734) {
    return base;
  }

  if (cat === "unknown") {
    if (
      rnk.includes("3m未満") ||
      rnk.includes("不明") ||
      rnk.includes("その他")
    ) {
      return ROAD_COLORS.gray;
    }
    if (w != null && w > 0 && w < 3) {
      return ROAD_COLORS.gray;
    }
  }

  return base;
};

const getBuildingColor = (f: {
  properties: Record<string, unknown>;
}): Color => {
  const p = f.properties;
  if (typeof p.type === "string") {
    const t = p.type;
    if (t.includes("普通建物") || t.includes("堅ろう建物"))
      return [255, 230, 190, 255];
    if (
      t.includes("高層建物") ||
      t.includes("普通無壁舎") ||
      t.includes("堅ろう無壁舎")
    )
      return [255, 135, 75, 255];
  }
  return [200, 200, 200, 255];
};

export const Denshi3dController = ({ mapId }: Props) => {
  const isDenshi3dEnabled = useStore(
    (state) => state.maps[mapId].isDenshi3dEnabled,
  );
  const roofElevationType = useStore(
    (state) => state.maps[mapId].roofElevationType,
  );
  const mapInstance = useMap()[mapId]?.getMap();
  const overlayRef = useRef<IControl | null>(null);

  useEffect(() => {
    if (!mapInstance) return;

    if (!isDenshi3dEnabled) {
      if (overlayRef.current) {
        mapInstance.removeControl(overlayRef.current);
        overlayRef.current = null;
      }
      return;
    }

    let cancelled = false;

    const setup = async () => {
      // Lazy-load deck.gl modules and GeoJSON data in parallel
      if (!railsPromise) {
        railsPromise = fetchGeoJson(DENSHI_KOKUDO_3D_CONFIG.RAILS_URL);
      }
      if (!roadsPromise) {
        roadsPromise = fetchGeoJson(DENSHI_KOKUDO_3D_CONFIG.ROADS_URL);
      }

      const [{ MapboxOverlay }, { GeoJsonLayer }, { MVTLayer }, rails, roads] =
        await Promise.all([
          import("@deck.gl/mapbox"),
          import("@deck.gl/layers"),
          import("@deck.gl/geo-layers"),
          railsPromise,
          roadsPromise,
        ]);

      if (cancelled) return;

      // roofElevationType変更時のレースコンディション対策
      if (overlayRef.current) {
        mapInstance.removeControl(overlayRef.current);
        overlayRef.current = null;
      }

      const railsWithHeight = addHeightToCoordinates(
        rails,
        DENSHI_KOKUDO_3D_CONFIG.ADD_HEIGHT,
      );
      const roadsWithHeight = addHeightToCoordinates(
        roads,
        DENSHI_KOKUDO_3D_CONFIG.ADD_HEIGHT,
      );
      const roadsInner = addHeightToCoordinates(
        roads,
        DENSHI_KOKUDO_3D_CONFIG.ADD_HEIGHT +
          DENSHI_KOKUDO_3D_CONFIG.ROAD_INNER_HEIGHT_OFFSET,
      );

      const layers = [
        new GeoJsonLayer({
          id: `${mapId}-denshi3d-rails`,
          data: railsWithHeight,
          lineWidthUnits: "meters",
          getLineColor: getRailLineColor,
          getLineWidth: getRailLineWidth,
        }),
        new GeoJsonLayer({
          id: `${mapId}-denshi3d-road-casing`,
          data: roadsWithHeight,
          lineWidthUnits: "meters",
          getLineColor: [120, 120, 120, 255],
          getLineWidth: getRoadCasingWidth,
          lineCapRounded: false,
          lineJointRounded: false,
        }),
        new GeoJsonLayer({
          id: `${mapId}-denshi3d-road-inner`,
          data: roadsInner,
          lineWidthUnits: "meters",
          getLineColor: getRoadLineColor,
          getLineWidth: getRoadInnerWidth,
          lineCapRounded: false,
          lineJointRounded: false,
        }),
        new MVTLayer({
          id: `${mapId}-denshi3d-buildings`,
          data: [DENSHI_KOKUDO_3D_CONFIG.BUILDINGS_TILE_URL],
          minZoom: DENSHI_KOKUDO_3D_CONFIG.MIN_ZOOM,
          maxZoom: DENSHI_KOKUDO_3D_CONFIG.MAX_ZOOM,
          getFillColor: getBuildingColor,
          getElevation: (f: { properties: Record<string, unknown> }) => {
            const rawRoofElv = f.properties[roofElevationType];
            const roofElv = Number(rawRoofElv);
            if (!Number.isFinite(roofElv) || roofElv === -9999) return 0;
            return Math.max(0, roofElv);
          },
          extruded: true,
          wireframe: false,
          opacity: 1,
        }),
      ];

      const overlay = new MapboxOverlay({ interleaved: true, layers });
      mapInstance.addControl(overlay as unknown as IControl);
      overlayRef.current = overlay as unknown as IControl;
    };

    if (mapInstance.isStyleLoaded()) {
      void setup();
    } else {
      const onStyleLoad = () => {
        void setup();
      };
      void mapInstance.once("style.load", onStyleLoad);
    }

    return () => {
      cancelled = true;
      if (overlayRef.current) {
        mapInstance.removeControl(overlayRef.current);
        overlayRef.current = null;
      }
    };
  }, [mapInstance, isDenshi3dEnabled, roofElevationType, mapId]);

  return null;
};
