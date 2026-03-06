"use client";

import { MapProvider } from "react-map-gl/maplibre";
import { useStore } from "@/hooks/store/useStore";
import { Map } from "./map";
import { cn } from "@/lib/utils";
import { ViewFooter } from "./view-footer";
import { SaveImageWindow } from "../save-image/save-image-window";
import { PrintDialog } from "../print/print-dialog";
import { OverlaySliderHandle } from "./overlay-slider-handle";

export const MapsView = () => {
  const activeMapIds = useStore((state) => state.activeMapIds);
  const layoutMode = useStore((state) => state.layoutMode);
  const overlaySliderPosition = useStore(
    (state) => state.overlaySliderPosition,
  );

  return (
    <MapProvider>
      <div className="flex gap-1 relative w-full h-full min-h-0">
        {activeMapIds.map((id) => (
          <Map
            key={id}
            mapId={id}
            className={cn({
              "absolute inset-0": layoutMode === "overlay",
            })}
            clipPath={
              layoutMode === "overlay"
                ? id === "main"
                  ? `inset(0 ${String((1 - overlaySliderPosition) * 100)}% 0 0)`
                  : `inset(0 0 0 ${String(overlaySliderPosition * 100)}%)`
                : undefined
            }
          />
        ))}
        {layoutMode === "overlay" && <OverlaySliderHandle />}
        <ViewFooter />
      </div>
      <SaveImageWindow />
      <PrintDialog />
    </MapProvider>
  );
};
