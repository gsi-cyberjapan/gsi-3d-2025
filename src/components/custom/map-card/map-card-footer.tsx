"use client";

import { useGlobalStore } from "@/hooks/store/useGlobalStore";
import { MapCenterInformation } from "./map-center-information";
import { cn } from "@/lib/utils";

export const MapCardFooter = () => {
  const viewMode = useGlobalStore((state) => state.viewMode);
  const mapMetas = useGlobalStore((state) => state.mapMetas);

  return (
    <div className={cn("p-2 flex gap-1")}>
      {(() => {
        if (viewMode === "single") {
          return <MapCenterInformation mapId={mapMetas[0].id} />;
        }
      })()}
    </div>
  );
};
