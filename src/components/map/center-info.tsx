"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useMap } from "react-map-gl/maplibre";
import { useQuery } from "@tanstack/react-query";
import { getAddressFromLatLng } from "@/lib/getAddressFromLatLng";
import { cn } from "@/lib/utils";
import { getUTMFromLatLng } from "@/lib/geUTMFromLatLng";
import { getElevationFromLatLng } from "@/lib/getElevationFromLatLng";
import { Skeleton } from "../ui/skeleton";

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
    staleTime: 1000 * 60 * 5,
  });
  const { data: elevation } = useQuery({
    queryKey: ["center-elevetion", lat, lon],
    queryFn: async () => {
      if (lat == null || lon == null) return null;
      return await getElevationFromLatLng(lat, lon);
    },
    enabled: lat != null && lon != null && !isMoving,
    placeholderData: (previous) => previous,
    staleTime: 1000 * 60 * 5,
  });
  const utm = useMemo(() => {
    if (lat == null || lon == null) return null;
    return getUTMFromLatLng(lat, lon);
  }, [lat, lon]);

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

  if (!viewState) {
    return (
      <div className="h-24 pt-2">
        <Skeleton className="h-3  w-32" />
        <Skeleton className="h-2 mt-2 w-48" />
        <Skeleton className="h-2 mt-2 w-48" />
        <Skeleton className="h-2 mt-2 w-48" />
        <Skeleton className="h-2 mt-2 w-48" />
      </div>
    );
  }
  return (
    <div className="text-xs text-muted-foreground">
      <div
        className={cn("font-semibold", {
          "text-foreground": !isAddressPending && !isMoving,
        })}
      >
        {address || "-"}
      </div>
      <table>
        <tbody>
          <tr>
            <td className="pr-2">緯度</td>
            <td>{viewState.latitude}</td>
          </tr>
          <tr>
            <td className="pr-2">経度</td>
            <td>{viewState.longitude}</td>
          </tr>
          <tr>
            <td className="pr-2">ズーム</td>
            <td>{viewState.zoom}</td>
          </tr>
          <tr>
            <td className="pr-2">UTM</td>
            <td>{utm ?? "-"}</td>
          </tr>
          <tr>
            <td className="pr-2">標高</td>
            <td>{elevation != undefined ? `${elevation.toString()}m` : "-"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
