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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [addressViewMode, setAddressViewMode] = useState("kanji");
  const [stableViewState, setStableViewState] = useState<ViewState | null>(
    null,
  );
  const [isMoving, setIsMoving] = useState(false);
  const frameRef = useRef<number | null>(null);
  const debounceRef = useRef<number | null>(null);
  const { data: address, isFetching: isAddressPending } = useQuery({
    queryKey: ["center-address", stableViewState],
    queryFn: async () => {
      if (stableViewState == null) return null;
      return await getAddressFromLatLng(
        stableViewState.latitude,
        stableViewState.longitude,
      );
    },
    placeholderData: (previous) => previous,
    staleTime: 1000 * 60 * 5,
  });
  const { data: elevation } = useQuery({
    queryKey: ["center-elevetion", stableViewState],
    queryFn: async () => {
      if (stableViewState == null) return null;
      return await getElevationFromLatLng(
        stableViewState.latitude,
        stableViewState.longitude,
      );
    },
    placeholderData: (previous) => previous,
    staleTime: 1000 * 60 * 5,
  });
  const utm = useMemo(() => {
    if (viewState === null) return null;
    return getUTMFromLatLng(viewState.latitude, viewState.longitude);
  }, [viewState]);

  const commitStableViewState = useCallback(() => {
    if (!map) return;
    const center = map.getCenter();
    const zoom = map.getZoom();
    setStableViewState({
      latitude: center.lat,
      longitude: center.lng,
      zoom,
    });
    setViewState({
      latitude: center.lat,
      longitude: center.lng,
      zoom,
    });
    setIsMoving(false);
    debounceRef.current = null;
  }, [map]);

  const handleMapOnMove = useCallback(() => {
    if (!map) return;
    setIsMoving(true);
    if (frameRef.current == null) {
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
    }

    if (debounceRef.current != null) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      commitStableViewState();
    }, 300);
  }, [commitStableViewState, map]);

  useEffect(() => {
    if (!map) return;

    void map.once("load", commitStableViewState);
    map.on("move", handleMapOnMove);

    return () => {
      map.off("move", handleMapOnMove);

      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      if (debounceRef.current != null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [commitStableViewState, handleMapOnMove, map]);

  if (!viewState) {
    return (
      <div className="h-24 pt-2">
        <Skeleton className="h-3  w-28" />
        <Skeleton className="h-2 mt-2 w-42" />
        <Skeleton className="h-2 mt-2 w-42" />
        <Skeleton className="h-2 mt-2 w-42" />
        <Skeleton className="h-2 mt-2 w-42" />
      </div>
    );
  }
  return (
    <div className="flex gap-2 justify-between w-full">
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
              <td>
                {elevation != undefined ? `${elevation.toString()}m` : "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Tabs value={addressViewMode} onValueChange={setAddressViewMode}>
        <TabsList className="h-6 rounded-sm">
          <TabsTrigger
            className="text-xs size-5 rounded-sm dark:data-[state=active]:bg-blue-600"
            value="kanji"
          >
            漢
          </TabsTrigger>
          <TabsTrigger
            className="text-xs size-5 rounded-sm dark:data-[state=active]:bg-blue-600"
            value="kana"
          >
            あ
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
