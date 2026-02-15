"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/maplibre";
import type { IControl } from "maplibre-gl";
import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { POINT_CLOUD_CONFIG } from "@/lib/config";
import {
  fetchTilesIndex,
  getViewportBounds,
} from "@/lib/pointcloud/tilesIndex";
import { boundsOverlap } from "@/lib/pointcloud/meshCodeToPolygon";

interface Props {
  mapId: MapId;
}

export const PointCloudController = ({ mapId }: Props) => {
  const isPointCloudEnabled = useStore(
    (state) => state.maps[mapId].isPointCloudEnabled,
  );
  const mapInstance = useMap()[mapId]?.getMap();
  const overlayRef = useRef<IControl | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!mapInstance) return;

    if (!isPointCloudEnabled) {
      // Remove overlay if it exists
      if (overlayRef.current) {
        mapInstance.removeControl(overlayRef.current);
        overlayRef.current = null;
      }
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      return;
    }

    let cancelled = false;

    const setup = async () => {
      const [{ MapboxOverlay }, { Tile3DLayer }] = await Promise.all([
        import("@deck.gl/mapbox"),
        import("@deck.gl/geo-layers"),
      ]);

      if (cancelled) return;

      const overlay = new MapboxOverlay({ layers: [] });
      mapInstance.addControl(overlay as unknown as IControl);
      overlayRef.current = overlay as unknown as IControl;

      const updateLayers = async () => {
        const zoom = mapInstance.getZoom();
        if (zoom < POINT_CLOUD_CONFIG.MIN_ZOOM) {
          overlay.setProps({ layers: [] });
          return;
        }

        const tiles = await fetchTilesIndex();
        const viewportBounds = getViewportBounds(mapInstance);

        const visibleTiles = tiles.filter((t) =>
          boundsOverlap(t.bounds, viewportBounds),
        );

        const layers = visibleTiles.map(
          (t) =>
            new Tile3DLayer({
              id: `${mapId}-pointcloud-${t.name}`,
              data: `${POINT_CLOUD_CONFIG.TILESET_BASE_URL}/${t.name}/tileset.json`,
              pointSize: 1,
            }),
        );

        overlay.setProps({ layers });
      };

      // Initial update
      await updateLayers();

      // Update on map move
      const onMoveEnd = () => {
        void updateLayers();
      };
      mapInstance.on("moveend", onMoveEnd);

      cleanupRef.current = () => {
        mapInstance.off("moveend", onMoveEnd);
      };
    };

    const onStyleLoad = () => {
      void setup();
    };

    if (mapInstance.isStyleLoaded()) {
      void setup();
    } else {
      void mapInstance.once("style.load", onStyleLoad);
    }

    return () => {
      cancelled = true;
      mapInstance.off("style.load", onStyleLoad);
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      if (overlayRef.current) {
        mapInstance.removeControl(overlayRef.current);
        overlayRef.current = null;
      }
    };
  }, [mapInstance, isPointCloudEnabled, mapId]);

  return null;
};
