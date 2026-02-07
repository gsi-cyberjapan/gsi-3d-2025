"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";

interface Props {
  mapId: MapId;
}

export const ViewStateController = ({ mapId }: Props) => {
  const map = useMap()[mapId]?.getMap();
  const setViewState = useStore((state) => state.setViewState);

  useEffect(() => {
    if (!map) return;

    const updateViewState = () => {
      const center = map.getCenter();
      setViewState(mapId, {
        latitude: center.lat,
        longitude: center.lng,
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
      });
    };

    updateViewState();
    map.on("moveend", updateViewState);
    return () => {
      map.off("moveend", updateViewState);
    };
  }, [map, mapId, setViewState]);

  return null;
};
