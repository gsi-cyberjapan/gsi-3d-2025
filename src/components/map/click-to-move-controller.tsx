"use client";

import { useMap } from "react-map-gl/maplibre";
import { useRef, useCallback, useEffect } from "react";
import type { MapMouseEvent } from "maplibre-gl";
import { useStore } from "@/hooks/store/useStore";
import { MapId } from "@/hooks/store/mapManagerState";

const DOUBLE_CLICK_INTERVAL = 300;

interface Props {
  mapId: MapId;
}

export const ClickToMoveController = ({ mapId }: Props) => {
  const { main: mainMapRef, sub: subMapRef } = useMap();
  const map = mapId === "main" ? mainMapRef?.getMap() : subMapRef?.getMap();
  const mainMap = mainMapRef?.getMap();
  const subMap = subMapRef?.getMap();
  const isClickToMoveEnabled = useStore((state) => state.isClickToMoveEnabled);
  const isSyncPosition = useStore((state) => state.isSyncPosition);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearClickTimer = useCallback(() => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
  }, []);

  const handleClick = useCallback(
    (ev: MapMouseEvent) => {
      if (!map) return;

      clearClickTimer();

      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        map.panTo(ev.lngLat);

        // 位置連動が有効な場合、もう一方のマップも移動
        if (isSyncPosition) {
          const otherMap = mapId === "main" ? subMap : mainMap;
          if (otherMap) {
            otherMap.panTo(ev.lngLat);
          }
        }
      }, DOUBLE_CLICK_INTERVAL);
    },
    [map, clearClickTimer, isSyncPosition, mapId, subMap, mainMap],
  );

  const handleDblClick = useCallback(() => {
    clearClickTimer();
  }, [clearClickTimer]);

  useEffect(() => {
    if (!map || !isClickToMoveEnabled) return;

    map.on("click", handleClick);
    map.on("dblclick", handleDblClick);

    return () => {
      clearClickTimer();
      map.off("click", handleClick);
      map.off("dblclick", handleDblClick);
    };
  }, [map, isClickToMoveEnabled, handleClick, handleDblClick, clearClickTimer]);

  return null;
};
