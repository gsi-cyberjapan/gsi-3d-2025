"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import {
  getMaplibreWithProtocol,
  MapLibreType,
} from "@/lib/getMaplibreWhithProtocol";
import { MapRef } from "react-map-gl/maplibre";
import { buildStyleFromBaseLayer } from "@/lib/buildStyleFromBaseLayer";
import { DEFAULT_VIEW_CONFIG } from "@/lib/config";
import { useStore } from "@/hooks/store/useStore";
import { useEffect, useState, useMemo, useRef } from "react";
import { ZoomLevelController } from "./zoom-level-controller";
import { PositionSyncController } from "./position-sync-controller";
import { OptionalLayers } from "./optional-layers";
import { MapCenterLine } from "./map-center-line";
import { DrawController } from "../draw/draw-controller";

import { TextRenderLayer } from "../draw/text-render-layer";
import { IconRenderLayer } from "../draw/icon-render-layer";
import { SearchResultController } from "./search-result-controller";
import { ClickToMoveController } from "./click-to-move-controller";
import { ViewStateController } from "./view-state-controller";
import { SelectionActionButtons } from "../draw/selection-action-buttons";
import { OverviewMap } from "./overview-map";
import { MeasureController } from "../measure/measure-controller";
import { Compass } from "./compass";
import { ZoomGuide } from "./zoom-guide";
import { LatLngGridController } from "./grids/lat-lng-grid-controller";
import { MapSheetNumbersController } from "./grids/map-sheet-numbers-controller";
import { RegionalMeshController } from "./grids/regional-mesh-controller";
import { TileGridController } from "./grids/tile-grid-controller";
import { UtmGridController } from "./grids/utm-grid-controller";
import { MagneticNorthController } from "./magnetic-north-controller";
import { ReliefLayer } from "./relief-layer";

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
  const viewState = useStore((state) => state.viewStates[mapId]);
  const showLoading = !mapLib || !isMapLoaded;
  const mapRef = useRef<MapRef>(null);
  const mapStyle = useMemo(
    () => buildStyleFromBaseLayer(baseLayer),
    [baseLayer],
  );

  // react-map-gl only uses initialViewState on its first mount, so
  // recomputing on viewState changes is harmless — the prop is ignored after mount.
  const initialViewState = useMemo(
    () =>
      viewState
        ? {
            longitude: viewState.longitude,
            latitude: viewState.latitude,
            zoom: viewState.zoom,
            bearing: viewState.bearing,
            pitch: viewState.pitch,
          }
        : {
            longitude: DEFAULT_VIEW_CONFIG.LONGITUDE,
            latitude: DEFAULT_VIEW_CONFIG.LATITUDE,
            zoom: DEFAULT_VIEW_CONFIG.ZOOM,
            bearing: DEFAULT_VIEW_CONFIG.BEARING,
            pitch: DEFAULT_VIEW_CONFIG.PITCH,
          },
    [viewState],
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

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    const observer = new ResizeObserver(() => {
      map.resize();
    });
    observer.observe(map.getContainer());
    return () => {
      observer.disconnect();
    };
  }, [mapLib, isMapLoaded]);

  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* opacityはこの内側のdivにのみ適用される */}
      <div className="w-full h-full" style={{ opacity }}>
        {mapLib && (
          <div
            className={cn(
              "w-full h-full transition-opacity duration-200",
              isMapLoaded ? "opacity-100" : "opacity-0",
            )}
          >
            <ReactMaplibre
              ref={mapRef}
              id={mapId}
              mapLib={mapLib}
              mapStyle={mapStyle}
              projection={projection}
              cursor="default"
              initialViewState={initialViewState}
              onLoad={() => {
                setIsMapLoaded(true);
              }}
            >
              <OptionalLayers mapId={mapId} />
              <ReliefLayer mapId={mapId} />
              {/* Mapインスタンスを直接操作するコンポーネント */}
              <DrawController mapId={mapId} />
              <MeasureController mapId={mapId} />
              <TextRenderLayer mapId={mapId} />
              <IconRenderLayer mapId={mapId} />
              <SelectionActionButtons mapId={mapId} />
              <ZoomLevelController mapId={mapId} />
              <SearchResultController />
              <ClickToMoveController mapId={mapId} />
              <MagneticNorthController mapId={mapId} />
              <LatLngGridController mapId={mapId} />
              <UtmGridController mapId={mapId} />
              <TileGridController mapId={mapId} />
              <RegionalMeshController mapId={mapId} />
              <MapSheetNumbersController mapId={mapId} />
              <ViewStateController mapId={mapId} />
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

      {/* OverviewMap、ZoomGuide、Compassはopacityの影響を受けない外側に配置 */}
      {isMapLoaded && <Compass mapId={mapId} />}
      {isMapLoaded && (
        <div className="absolute bottom-2 right-2 z-10 flex flex-col gap-2 items-end">
          <OverviewMap mapId={mapId} />
          <ZoomGuide mapId={mapId} />
        </div>
      )}
    </div>
  );
};
