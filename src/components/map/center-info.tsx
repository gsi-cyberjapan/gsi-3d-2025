"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useMap } from "react-map-gl/maplibre";
import { useQuery } from "@tanstack/react-query";
import { getAddressFromLatLng } from "@/lib/map-utils/getAddressFromLatLng";
import { cn } from "@/lib/utils";
import { getUTMFromLatLng } from "@/lib/map-utils/geUTMFromLatLng";
import { getElevationFromLatLng } from "@/lib/map-utils/getElevationFromLatLng";
import { latLngToDMS } from "@/lib/map-utils/latLngToDMS";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Locate, Pointer } from "lucide-react";
import { ResetViewButton } from "@/components/map/reset-view-button";

interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

interface Props {
  mapId: MapId;
}

type InfoMode = "center" | "click";

export const CenterInfo = ({ mapId }: Props) => {
  const map = useMap()[mapId]?.getMap();
  const [viewState, setViewState] = useState<ViewState | null>(null);
  const [clickedViewState, setClickedViewState] = useState<ViewState | null>(
    null,
  );
  const [addressViewMode, setAddressViewMode] = useState("kanji");
  const [infoMode, setInfoMode] = useState<InfoMode>("center");
  const [stableViewState, setStableViewState] = useState<ViewState | null>(
    null,
  );
  const [isMoving, setIsMoving] = useState(false);
  const frameRef = useRef<number | null>(null);
  const debounceRef = useRef<number | null>(null);
  const isCenterMode = infoMode === "center";
  const displayViewState = isCenterMode ? viewState : clickedViewState;
  const displayStableViewState = isCenterMode
    ? stableViewState
    : clickedViewState;
  const { data: address, isFetching: isAddressPending } = useQuery({
    queryKey: ["center-address", displayStableViewState],
    queryFn: async () => {
      if (displayStableViewState == null) return null;
      return await getAddressFromLatLng(
        displayStableViewState.latitude,
        displayStableViewState.longitude,
      );
    },
    placeholderData: (previous) => previous,
    staleTime: 1000 * 60 * 5,
  });
  const { data: elevation } = useQuery({
    queryKey: ["center-elevetion", displayStableViewState],
    queryFn: async () => {
      if (displayStableViewState == null) return null;
      return await getElevationFromLatLng(
        displayStableViewState.latitude,
        displayStableViewState.longitude,
      );
    },
    placeholderData: (previous) => previous,
    staleTime: 1000 * 60 * 5,
  });
  const utm = useMemo(() => {
    if (displayViewState === null) return null;
    return getUTMFromLatLng(
      displayViewState.latitude,
      displayViewState.longitude,
    );
  }, [displayViewState]);
  const dms = useMemo(() => {
    if (displayViewState === null) return null;
    return latLngToDMS(displayViewState.latitude, displayViewState.longitude);
  }, [displayViewState]);
  const isAddressReady = !isAddressPending && (isCenterMode ? !isMoving : true);
  const handleInfoModeChange = useCallback((value: string) => {
    if (value === "center" || value === "click") {
      setInfoMode(value);
    }
  }, []);

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

  const handleMapOnClick = useCallback(
    (event: { lngLat: { lat: number; lng: number } }) => {
      if (!map) return;
      const zoom = map.getZoom();
      setClickedViewState({
        latitude: event.lngLat.lat,
        longitude: event.lngLat.lng,
        zoom,
      });
    },
    [map],
  );

  useEffect(() => {
    if (!map) return;

    void map.once("load", commitStableViewState);
    map.on("move", handleMapOnMove);
    map.on("click", handleMapOnClick);

    return () => {
      map.off("move", handleMapOnMove);
      map.off("click", handleMapOnClick);

      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      if (debounceRef.current != null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [commitStableViewState, handleMapOnMove, map, handleMapOnClick]);

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
    <div className="text-xs text-muted-foreground relative px-1">
      <div
        className={cn("font-semibold flex items-center gap-1", {
          "text-foreground": isAddressReady,
        })}
      >
        {(() => {
          if (!address) return "-";
          if (addressViewMode === "kanji") return address.kanji;
          return address.kana;
        })()}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="cursor-help"
              aria-label="住所の注意事項"
            >
              <Info className="size-3 shrink-0 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            付近の住所。正確な所属を示すとは限らない。
          </TooltipContent>
        </Tooltip>
      </div>
      <table>
        <tbody>
          <tr>
            <td className="pr-2 align-top">経緯度</td>
            <td>
              {displayViewState && dms ? (
                <>
                  <div>
                    {dms.lat} {dms.lng}
                  </div>
                  <div className="text-muted-foreground">
                    {displayViewState.latitude.toFixed(6)},
                    {displayViewState.longitude.toFixed(6)}
                  </div>
                </>
              ) : (
                "-"
              )}
            </td>
          </tr>
          <tr>
            <td className="pr-2">ズーム</td>
            <td>{displayViewState ? displayViewState.zoom.toFixed(2) : "-"}</td>
          </tr>
          <tr>
            <td className="pr-2">UTM</td>
            <td>{utm ?? "-"}</td>
          </tr>
          <tr>
            <td className="pr-2 align-top whitespace-nowrap">
              標高
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="cursor-help"
                    aria-label="標高データの注意事項"
                  >
                    <Info className="size-3 inline-block ml-0.5 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>全国標高改定以前の値</TooltipContent>
              </Tooltip>
            </td>
            <td>
              {elevation != null
                ? `${elevation.elevation.toString()}m (${elevation.hsrc})`
                : "-"}
            </td>
          </tr>
        </tbody>
      </table>
      <div className="flex flex-col gap-1 absolute z-10 -top-16">
        <ResetViewButton mapId={mapId} />
        <div className="flex justify-between">
          <Tabs value={addressViewMode} onValueChange={setAddressViewMode}>
            <TabsList className="h-6 rounded-sm">
              <TabsTrigger
                className="text-xs size-5 rounded-sm dark:data-[state=active]:bg-blue-600 dark:hover:text-foreground"
                value="kanji"
              >
                漢
              </TabsTrigger>
              <TabsTrigger
                className="text-xs size-5 rounded-sm dark:data-[state=active]:bg-blue-600 dark:hover:text-foreground"
                value="kana"
              >
                あ
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs value={infoMode} onValueChange={handleInfoModeChange}>
            <TabsList className="h-6 rounded-sm">
              <TabsTrigger
                className="text-xs px-2 size-5 rounded-sm dark:data-[state=active]:bg-blue-600 dark:hover:text-foreground"
                value="center"
              >
                <Locate />
              </TabsTrigger>
              <TabsTrigger
                className="text-xs px-2 size-5 rounded-sm dark:data-[state=active]:bg-blue-600 dark:hover:text-foreground"
                value="click"
              >
                <Pointer />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
