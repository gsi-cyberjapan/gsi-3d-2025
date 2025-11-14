"use client";

import { Spinner } from "@/components/ui/spinner";
import dynamic from "next/dynamic";
import { ComponentProps, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MapState } from "@/hooks/store/createMapSlice";
import { useGlobalStore } from "@/hooks/store/useGlobalStore";
import { MAP_CONFIG } from "@/lib/config";

const ReactMaplibre = dynamic(
  () => import("@vis.gl/react-maplibre").then((m) => m.Map),
  {
    ssr: false,
    loading: () => (
      <div
        aria-busy="true"
        className="w-full h-full flex items-center justify-center"
      >
        <div className="flex gap-2 items-center text-muted-foreground">
          <Spinner />
          <span>地図を読み込み中...</span>
        </div>
      </div>
    ),
  },
);

export type MapInitialViewState = ComponentProps<
  typeof ReactMaplibre
>["initialViewState"];

interface Props {
  id: string;
  initialViewState: MapInitialViewState;
  initialMapState: MapState;
  opacity?: number;
  className?: string;
}

export const Map = ({
  id,
  initialViewState,
  opacity,
  className,
  initialMapState,
}: Props) => {
  const initMaps = useGlobalStore((state) => state.initMaps);

  useEffect(() => {
    initMaps({
      [MAP_CONFIG.MAP_PRIMARY.ID]: initialMapState,
      [MAP_CONFIG.MAP_SECONDARY.ID]: initialMapState,
    });
  }, [initMaps, initialMapState]);

  return (
    <div
      className={cn("w-full h-full", className)}
      style={{ opacity: opacity }}
    >
      <ReactMaplibre
        id={id}
        initialViewState={initialViewState}
        mapStyle="https://demotiles.maplibre.org/style.json"
      />
    </div>
  );
};
