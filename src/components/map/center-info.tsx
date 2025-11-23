"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useEffect, useState, useCallback, useRef } from "react";
import { useMap } from "react-map-gl/maplibre";
import { useQuery } from "@tanstack/react-query";
import { getAddressFromLatLng } from "@/lib/getAddressFromLatLng";
import { cn } from "@/lib/utils";

interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

interface Props {
  mapId: MapId;
}

export const CenterInfo = ({ mapId }: Props) => {
  const map = useMap()[mapId]?.getMap();
  const [viewState, setViewState] = useState<ViewState | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const frameRef = useRef<number | null>(null);
  const lat = viewState?.latitude ?? null;
  const lon = viewState?.longitude ?? null;
  const { data: address, isFetching: isAddressPending } = useQuery({
    queryKey: ["center-address", lat, lon],
    queryFn: async () => {
      if (lat == null || lon == null) return null;
      return await getAddressFromLatLng(lat, lon);
    },
    enabled: lat != null && lon != null && !isMoving,
    placeholderData: (previous) => previous,
    staleTime: 1000 * 60 * 10,
  });

  const handleMapOnMove = useCallback(() => {
    if (!map) return;

    setIsMoving(true);

    if (frameRef.current != null) return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;

      const center = map.getCenter();
      const zoom = map.getZoom();

      setViewState({
        latitude: center.lat,
        longitude: center.lng,
        zoom,
      });
    });
  }, [map]);

  const handleMapOnMoveEnd = useCallback(() => {
    setIsMoving(false);

    if (!map) return;

    const center = map.getCenter();
    const zoom = map.getZoom();

    setViewState({
      latitude: center.lat,
      longitude: center.lng,
      zoom,
    });
  }, [map]);

  useEffect(() => {
    if (!map) return;

    void map.once("load", handleMapOnMoveEnd);
    map.on("move", handleMapOnMove);
    map.on("moveend", handleMapOnMoveEnd);

    return () => {
      map.off("move", handleMapOnMove);
      map.off("moveend", handleMapOnMoveEnd);

      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [map, handleMapOnMove, handleMapOnMoveEnd]);

  return (
    <div className="text-xs text-muted-foreground">
      <span
        className={cn("font-semibold", {
          "text-foreground": !isAddressPending && !isMoving,
        })}
      >
        {address || "------"}
      </span>
    </div>
  );
};
