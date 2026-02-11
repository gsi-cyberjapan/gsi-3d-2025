"use client";

import { useMap } from "react-map-gl/maplibre";
import { useEffect, useRef } from "react";
import { useStore } from "@/hooks/store/useStore";
import { DEFAULT_VIEW_CONFIG } from "@/lib/config";

export const ResetViewController = () => {
  const maps = useMap();
  const resetTrigger = useStore((state) => state.resetTrigger);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    for (const key of Object.keys(maps)) {
      const mapRef = maps[key];
      const map = mapRef?.getMap();
      if (map) {
        map.flyTo({
          center: [DEFAULT_VIEW_CONFIG.LONGITUDE, DEFAULT_VIEW_CONFIG.LATITUDE],
          zoom: DEFAULT_VIEW_CONFIG.ZOOM,
          bearing: DEFAULT_VIEW_CONFIG.BEARING,
          pitch: DEFAULT_VIEW_CONFIG.PITCH,
          duration: 500,
        });
      }
    }
  }, [resetTrigger, maps]);

  return null;
};
