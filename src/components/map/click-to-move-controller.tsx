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
  const map = useMap()[mapId]?.getMap();
  const isClickToMoveEnabled = useStore((state) => state.isClickToMoveEnabled);
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
      }, DOUBLE_CLICK_INTERVAL);
    },
    [map, clearClickTimer],
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
