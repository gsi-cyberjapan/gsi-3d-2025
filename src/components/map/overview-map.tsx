"use client";

import { useStore } from "@/hooks/store/useStore";
import { useMap } from "react-map-gl/maplibre";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapId } from "@/hooks/store/mapManagerState";
import {
  getMaplibreWithProtocol,
  MapLibreType,
} from "@/lib/getMaplibreWhithProtocol";
import { cn } from "@/lib/utils";

const OVERVIEW_TILE_URL =
  "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png";

const OVERVIEW_SIZE = {
  width: 150,
  height: 150,
};

const OVERVIEW_ZOOM_OFFSET = 5;

interface Props {
  mapId: MapId;
}

export const OverviewMap = ({ mapId }: Props) => {
  const isDisplayOverview = useStore((state) => state.isDisplayOverview);
  const focusMapId = useStore((state) => state.focusMapId);
  const containerRef = useRef<HTMLDivElement>(null);
  const overviewMapRef = useRef<maplibregl.Map | null>(null);
  const [mapLib, setMapLib] = useState<MapLibreType | null>(null);
  const { [mapId]: map } = useMap();

  // Flags to prevent infinite loops between main map and overview map
  const mainMapMovingRef = useRef(false);
  const overviewMapMovingRef = useRef(false);

  // Only show overview for the focused map
  const shouldShow = isDisplayOverview && focusMapId === mapId;

  // Load MapLibre library
  useEffect(() => {
    let cancelled = false;
    getMaplibreWithProtocol()
      .then((lib) => {
        if (!cancelled) {
          setMapLib(lib);
        }
      })
      .catch((err: unknown) => {
        console.error("Failed to load maplibre for overview:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Calculate overview map zoom from main map zoom
  const getOverviewZoom = useCallback((mainZoom: number) => {
    return Math.max(0, mainZoom - OVERVIEW_ZOOM_OFFSET);
  }, []);

  // Calculate main map zoom from overview map zoom
  const getMainMapZoom = useCallback((overviewZoom: number) => {
    return overviewZoom + OVERVIEW_ZOOM_OFFSET;
  }, []);

  // Update viewport rectangle on the overview map
  const updateViewportRect = useCallback(() => {
    const overviewMap = overviewMapRef.current;
    const mainMap = map?.getMap();
    if (!overviewMap || !mainMap) return;

    const bounds = mainMap.getBounds();
    const source = overviewMap.getSource("viewport-bounds");
    if (!source) return;

    (source as maplibregl.GeoJSONSource).setData({
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [bounds.getWest(), bounds.getNorth()],
            [bounds.getEast(), bounds.getNorth()],
            [bounds.getEast(), bounds.getSouth()],
            [bounds.getWest(), bounds.getSouth()],
            [bounds.getWest(), bounds.getNorth()],
          ],
        ],
      },
    });
  }, [map]);

  // Sync overview map position when main map moves
  const syncOverviewToMain = useCallback(() => {
    const overviewMap = overviewMapRef.current;
    const mainMap = map?.getMap();
    if (!overviewMap || !mainMap) return;

    const center = mainMap.getCenter();
    const zoom = getOverviewZoom(mainMap.getZoom());
    // Use jumpTo to set center and zoom atomically (triggers only one moveend event)
    overviewMap.jumpTo({ center, zoom });
  }, [map, getOverviewZoom]);

  // Initialize overview map
  useEffect(() => {
    if (!shouldShow || !mapLib || !containerRef.current || !map) return;

    const mainMap = map.getMap();
    const center = mainMap.getCenter();
    const zoom = getOverviewZoom(mainMap.getZoom());

    const overviewMap = new mapLib.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          "overview-tiles": {
            type: "raster",
            tiles: [OVERVIEW_TILE_URL],
            tileSize: 256,
            attribution: "",
          },
        },
        layers: [
          {
            id: "overview-layer",
            type: "raster",
            source: "overview-tiles",
          },
        ],
      },
      center: [center.lng, center.lat],
      zoom,
      interactive: true,
      attributionControl: false,
      // Disable rotation and pitch for overview map
      pitchWithRotate: false,
      dragRotate: false,
      touchPitch: false,
    });

    overviewMapRef.current = overviewMap;

    overviewMap.on("load", () => {
      // Add viewport bounds source and layer (aiming rect - current view)
      overviewMap.addSource("viewport-bounds", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [[[0, 0]]],
          },
        },
      });

      overviewMap.addLayer({
        id: "viewport-bounds-fill",
        type: "fill",
        source: "viewport-bounds",
        paint: {
          "fill-color": "#ff0000",
          "fill-opacity": 0.2,
        },
      });

      overviewMap.addLayer({
        id: "viewport-bounds-line",
        type: "line",
        source: "viewport-bounds",
        paint: {
          "line-color": "#ff0000",
          "line-width": 1,
        },
      });

      // Add shadow rect source and layer (shown during drag)
      overviewMap.addSource("shadow-bounds", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [[[0, 0]]],
          },
        },
      });

      overviewMap.addLayer({
        id: "shadow-bounds-fill",
        type: "fill",
        source: "shadow-bounds",
        paint: {
          "fill-color": "#000000",
          "fill-opacity": 0,
        },
      });

      overviewMap.addLayer({
        id: "shadow-bounds-line",
        type: "line",
        source: "shadow-bounds",
        paint: {
          "line-color": "#000000",
          "line-width": 1,
          "line-opacity": 0,
        },
      });

      updateViewportRect();
      syncOverviewToMain();
    });

    // Handle main map move events
    const onMainMapMove = () => {
      updateViewportRect();
    };

    const onMainMapMoveEnd = () => {
      // Skip if overview map initiated this move
      if (overviewMapMovingRef.current) return;

      mainMapMovingRef.current = true;
      syncOverviewToMain();
      // Reset flag after current event cycle completes
      requestAnimationFrame(() => {
        mainMapMovingRef.current = false;
      });
    };

    // Store the last aiming rect position for shadow rect calculation during drag
    let lastAimingRectBounds: maplibregl.LngLatBounds | null = null;

    // Handle overview map drag start
    const onOverviewMoveStart = () => {
      const bounds = mainMap.getBounds();
      lastAimingRectBounds = bounds;
    };

    // Handle overview map move (during drag)
    const onOverviewMove = () => {
      if (mainMapMovingRef.current || !lastAimingRectBounds) return;

      // Show shadow rect at the original position during drag
      const shadowSource = overviewMap.getSource("shadow-bounds");
      if (!shadowSource) return;

      (shadowSource as maplibregl.GeoJSONSource).setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [lastAimingRectBounds.getWest(), lastAimingRectBounds.getNorth()],
              [lastAimingRectBounds.getEast(), lastAimingRectBounds.getNorth()],
              [lastAimingRectBounds.getEast(), lastAimingRectBounds.getSouth()],
              [lastAimingRectBounds.getWest(), lastAimingRectBounds.getSouth()],
              [lastAimingRectBounds.getWest(), lastAimingRectBounds.getNorth()],
            ],
          ],
        },
      });
      overviewMap.setPaintProperty("shadow-bounds-fill", "fill-opacity", 0.3);
      overviewMap.setPaintProperty("shadow-bounds-line", "line-opacity", 1);
    };

    // Handle overview map move end (drag end)
    const onOverviewMoveEnd = () => {
      // Skip if main map initiated this move
      if (mainMapMovingRef.current) return;

      overviewMapMovingRef.current = true;
      // Move main map to overview map's center
      const newCenter = overviewMap.getCenter();
      const newZoom = getMainMapZoom(overviewMap.getZoom());
      // Use jumpTo to set center and zoom atomically (triggers only one moveend event)
      mainMap.jumpTo({ center: newCenter, zoom: newZoom });
      // Hide shadow rect
      overviewMap.setPaintProperty("shadow-bounds-fill", "fill-opacity", 0);
      overviewMap.setPaintProperty("shadow-bounds-line", "line-opacity", 0);
      // Reset flag after current event cycle completes
      requestAnimationFrame(() => {
        overviewMapMovingRef.current = false;
      });
    };

    // Handle click on overview map - move main map to clicked location
    // and center overview map on clicked location
    const onOverviewClick = (e: maplibregl.MapMouseEvent) => {
      overviewMapMovingRef.current = true;
      mainMap.setCenter(e.lngLat);
      overviewMap.setCenter(e.lngLat);
      requestAnimationFrame(() => {
        overviewMapMovingRef.current = false;
      });
    };

    mainMap.on("move", onMainMapMove);
    mainMap.on("moveend", onMainMapMoveEnd);
    overviewMap.on("movestart", onOverviewMoveStart);
    overviewMap.on("move", onOverviewMove);
    overviewMap.on("moveend", onOverviewMoveEnd);
    overviewMap.on("click", onOverviewClick);

    return () => {
      mainMap.off("move", onMainMapMove);
      mainMap.off("moveend", onMainMapMoveEnd);
      overviewMap.off("movestart", onOverviewMoveStart);
      overviewMap.off("move", onOverviewMove);
      overviewMap.off("moveend", onOverviewMoveEnd);
      overviewMap.off("click", onOverviewClick);
      overviewMapRef.current?.remove();
      overviewMapRef.current = null;
    };
  }, [
    shouldShow,
    mapLib,
    map,
    getOverviewZoom,
    getMainMapZoom,
    updateViewportRect,
    syncOverviewToMain,
  ]);

  if (!shouldShow) return null;

  return (
    <div
      className={cn(
        "absolute bottom-4 right-4 z-10 rounded-md overflow-hidden shadow-lg border border-border bg-background",
      )}
      style={{
        width: OVERVIEW_SIZE.width,
        height: OVERVIEW_SIZE.height,
      }}
    >
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
