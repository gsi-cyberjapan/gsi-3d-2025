"use client";

import { Spinner } from "@/components/ui/spinner";
import dynamic from "next/dynamic";
import { ComponentProps, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MapState } from "@/hooks/store/createMapSlice";
import { useGlobalStore } from "@/hooks/store/useGlobalStore";
import { MapId } from "@/hooks/store/createMapCardSlice";

const MapLoadInformation = ({ message }: { message: string }) => {
  return (
    <div
      aria-busy="true"
      className="w-full h-full flex items-center justify-center"
    >
      <div className="flex gap-2 items-center text-muted-foreground">
        <Spinner />
        <span>{message}</span>
      </div>
    </div>
  );
};

const ReactMaplibre = dynamic(
  () => import("@vis.gl/react-maplibre").then((m) => m.Map),
  {
    ssr: false,
    loading: () => <MapLoadInformation message="地図を読み込み中..." />,
  },
);

export type MapInitialViewState = ComponentProps<
  typeof ReactMaplibre
>["initialViewState"];

interface Props {
  id: MapId;
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
  const initMap = useGlobalStore((state) => state.initMap);
  const baseData = useGlobalStore((state) => state.maps[id]?.mapBaseData);

  useEffect(() => {
    initMap(id, initialMapState);
  }, [initMap, id, initialMapState]);

  if (!baseData) {
    return <MapLoadInformation message="地図を初期化中..." />;
  }

  return (
    <div
      className={cn("w-full h-full", className)}
      style={{ opacity: opacity }}
    >
      <ReactMaplibre id={id} initialViewState={initialViewState} />
    </div>
  );
};
