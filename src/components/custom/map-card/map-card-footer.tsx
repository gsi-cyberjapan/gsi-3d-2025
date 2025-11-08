"use client";

import { useGlobalStore } from "@/hooks/store/useGlobalStore";
import { MapCenterInformation } from "./map-center-information";
import { SplitMapSeceltor } from "./split-map-selector";

export const MapCardFooter = () => {
  const viewMode = useGlobalStore((state) => state.viewMode);
  const mapMetas = useGlobalStore((state) => state.mapMetas);

  return (
    <div className="p-2">
      {(() => {
        if (viewMode === "split") {
          return <SplitMapSeceltor />;
        }
        return <MapCenterInformation mapId={mapMetas[0].id} />;
      })()}
    </div>
  );
};
