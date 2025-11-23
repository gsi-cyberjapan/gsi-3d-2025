"use client";

import { MapProvider } from "react-map-gl/maplibre";
import { useStore } from "@/hooks/store/useStore";
import { Map } from "./map";
import { cn } from "@/lib/utils";

export const MapsView = () => {
  const activeMapIds = useStore((state) => state.activeMapIds);
  const layoutMode = useStore((state) => state.layoutMode);
  const subMapOpacityOnOverlay = useStore(
    (state) => state.subMapOpacityOnOverlay,
  );

  return (
    <MapProvider>
      <div className="flex gap-1 relative h-full w-full">
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
    </MapProvider>
  );
};
