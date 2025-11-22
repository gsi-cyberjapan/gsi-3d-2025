"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";

const ReactMaplibre = dynamic(
  () => import("@vis.gl/react-maplibre").then((m) => m.Map),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex gap-2 text-muted-foreground items-center">
          <Spinner />
          <div>地図を読み込み中</div>
        </div>
      </div>
    ),
  },
);

interface Props {
  mapId: MapId;
  opacity?: number;
  className?: string;
}
export const Map = ({ mapId, className, opacity }: Props) => {
  return (
    <div
      className={cn("w-full h-full", className)}
      style={{ opacity: opacity }}
    >
      <ReactMaplibre
        id={mapId}
        mapStyle="https://demotiles.maplibre.org/style.json"
      />
    </div>
  );
};
