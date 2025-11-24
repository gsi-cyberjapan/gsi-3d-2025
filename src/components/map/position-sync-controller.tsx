"use client";

import { useMap } from "react-map-gl/maplibre";
import { useRef, useCallback, useEffect } from "react";
import type { MapLibreEvent } from "maplibre-gl";
import { useStore } from "@/hooks/store/useStore";

export const PositionSyncController = () => {
  const mainMap = useMap()["main"]?.getMap();
  const subMap = useMap()["sub"]?.getMap();
  const rafRef = useRef<number | undefined>(undefined);
  const isSyncPosition = useStore((state) => state.isSyncPosition);

  const handleMainMapMove = useCallback(
    (ev?: MapLibreEvent<MouseEvent | TouchEvent | WheelEvent | undefined>) => {
      if (!mainMap || !subMap) return;
      if (ev && (!("originalEvent" in ev) || !ev.originalEvent)) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = undefined;
        const mainMapCenter = mainMap.getCenter();
        const mainMapZoom = mainMap.getZoom();
        const mainMapBearing = mainMap.getBearing();
        const mainMapPitch = mainMap.getPitch();
        subMap.jumpTo({
          center: [mainMapCenter.lng, mainMapCenter.lat],
          zoom: mainMapZoom,
          bearing: mainMapBearing,
          pitch: mainMapPitch,
        });
      });
    },
    [mainMap, subMap],
  );

  const handleSubMapMove = useCallback(
    (ev?: MapLibreEvent<MouseEvent | TouchEvent | WheelEvent | undefined>) => {
      if (!mainMap || !subMap) return;
      if (ev && (!("originalEvent" in ev) || !ev.originalEvent)) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = undefined;
        const subMapCenter = subMap.getCenter();
        const subMapZoom = subMap.getZoom();
        const subMapBearing = subMap.getBearing();
        const subMapPitch = subMap.getPitch();
        mainMap.jumpTo({
          center: [subMapCenter.lng, subMapCenter.lat],
          zoom: subMapZoom,
          bearing: subMapBearing,
          pitch: subMapPitch,
        });
      });
    },
    [mainMap, subMap],
  );

  useEffect(() => {
    if (!mainMap || !subMap || !isSyncPosition) return;
    handleMainMapMove();
    mainMap.on("move", handleMainMapMove);
    subMap.on("move", handleSubMapMove);
    return () => {
      mainMap.off("move", handleMainMapMove);
      subMap.off("move", handleSubMapMove);
      if (rafRef.current !== undefined) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleMainMapMove, handleSubMapMove, isSyncPosition, mainMap, subMap]);

  return null;
};
