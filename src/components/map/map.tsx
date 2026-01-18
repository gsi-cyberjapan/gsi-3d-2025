"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import {
  getMaplibreWithProtocol,
  MapLibreType,
} from "@/lib/getMaplibreWhithProtocol";
import { buildStyleFromBaseLayer } from "@/lib/buildStyleFromBaseLayer";
import { useStore } from "@/hooks/store/useStore";
import { useEffect, useState, useMemo } from "react";
import { ZoomLevelController } from "./zoom-level-controller";
import { PositionSyncController } from "./position-sync-controller";
import { OptionalLayers } from "./optional-layers";
import { MapCenterLine } from "./map-center-line";
import { DrawController } from "../draw/draw-controller";
import { TextRenderLayer } from "../draw/text-render-layer";
import { IconRenderLayer } from "../draw/icon-render-layer";
import { SearchResultController } from "./search-result-controller";
import { SelectionActionButtons } from "../draw/selection-action-buttons";

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
  const projection = useStore((state) => state.maps[mapId].projection);
  const showLoading = !mapLib || !isMapLoaded;
  const mapStyle = useMemo(
    () => buildStyleFromBaseLayer(baseLayer),
    [baseLayer],
  );

  useEffect(() => {
    let cancelled = false;

    getMaplibreWithProtocol()
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
          >
            <OptionalLayers mapId={mapId} />
            {/* Mapインスタンスを直接操作するコンポーネント */}
            <DrawController mapId={mapId} />
            <TextRenderLayer mapId={mapId} />
            <IconRenderLayer mapId={mapId} />
            <SelectionActionButtons mapId={mapId} />
            <ZoomLevelController mapId={mapId} />
            <SearchResultController />
            <PositionSyncController />
          </ReactMaplibre>
        </div>
      )}

      {isMapLoaded && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <MapCenterLine />
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
