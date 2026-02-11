"use client";

import { MapProvider } from "react-map-gl/maplibre";
import { useStore } from "@/hooks/store/useStore";
import { Map } from "./map";
import { cn } from "@/lib/utils";
import { ViewFooter } from "./view-footer";
import { ResetViewController } from "./reset-view-controller";

export const MapsView = () => {
  const activeMapIds = useStore((state) => state.activeMapIds);
  const layoutMode = useStore((state) => state.layoutMode);
  const subMapOpacityOnOverlay = useStore(
    (state) => state.subMapOpacityOnOverlay,
  );

  return (
    <MapProvider>
      <div className="flex flex-col h-full">
        <div className="flex-1 flex gap-1 relative w-full min-h-0">
          {activeMapIds.map((id) => (
            <Map
              key={id}
              mapId={id}
              className={cn({
                absolute: layoutMode === "overlay" && id === "sub",
              })}
              opacity={
                layoutMode === "overlay" && id === "sub"
                  ? subMapOpacityOnOverlay
                  : undefined
              }
            />
          ))}
        </div>
        <ViewFooter />
      </div>
      <ResetViewController />
    </MapProvider>
  );
};
