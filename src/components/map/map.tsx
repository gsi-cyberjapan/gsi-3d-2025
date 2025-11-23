"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import {
  getMaplibreWithPmtiles,
  MapLibreType,
} from "@/lib/getMaplibreWhithProtocl";
import { buildStyleFromBaseLayer } from "@/lib/buildStyleFromBaseLayer";
import { useStore } from "@/hooks/store/useStore";
import { useEffect, useState, useMemo } from "react";

const ReactMaplibre = dynamic(
  () => import("react-map-gl/maplibre").then((m) => m.Map),
  {
    ssr: false,
  },
);

interface Props {
  mapId: MapId;
  opacity?: number;
  className?: string;
}
export const Map = ({ mapId, className, opacity }: Props) => {
  const baseLayer = useStore((state) => state.maps[mapId].baseLayer);
  const [mapLib, setMapLib] = useState<MapLibreType | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const showLoading = !mapLib || !isMapLoaded;
  const mapStyle = useMemo(
    () => buildStyleFromBaseLayer(baseLayer),
    [baseLayer],
  );
  const projection = useMemo(
    () => (baseLayer.type === "globe" ? "globe" : "mercator"),
    [baseLayer.type],
  );

  useEffect(() => {
    let cancelled = false;

    getMaplibreWithPmtiles()
      .then((lib) => {
        if (!cancelled) {
          setMapLib(lib);
        }
      })
      .catch((err: unknown) => {
        console.error("Failed to load maplibre:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className={cn("relative w-full h-full", className)}
      style={{ opacity }}
    >
      {mapLib && (
        <div
          className={cn(
            "w-full h-full transition-opacity duration-200",
            isMapLoaded ? "opacity-100" : "opacity-0",
          )}
        >
          <ReactMaplibre
            id={mapId}
            mapLib={mapLib}
            mapStyle={mapStyle}
            projection={projection}
            initialViewState={{
              longitude: 140.084556,
              latitude: 36.104611,
              zoom: 4,
            }}
            onLoad={() => {
              setIsMapLoaded(true);
            }}
          />
        </div>
      )}

      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-background transition-opacity duration-200",
          showLoading ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none ">
          <div className="flex gap-2 text-muted-foreground items-center">
            <Spinner />
            <div>地図を読み込み中</div>
          </div>
        </div>
      </div>
    </div>
  );
};
