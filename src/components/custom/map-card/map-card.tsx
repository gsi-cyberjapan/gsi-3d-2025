"use client";

import { Map } from "./map";
import { useGlobalStore } from "@/hooks/store/useGlobalStore";
import { cn } from "@/lib/utils";
import { MapCardFooter } from "./map-card-footer";
import { MapState } from "@/hooks/store/createMapSlice";

interface Props {
  initialMapState: MapState;
}

export const MapCard = ({ initialMapState }: Props) => {
  const viewMode = useGlobalStore((state) => state.viewMode);
  const subMapOpacity = useGlobalStore((state) => state.subMapOpacity);
  const mapMetas = useGlobalStore((state) => state.mapMetas);
  const isHideSubMap = useGlobalStore((state) => state.isHideSubmap);

  return (
    <div className="w-full h-full flex flex-col rounded-md overflow-hidden border">
      <div className="h-full flex gap-1 relative">
        {mapMetas.map((meta, index) => (
          <Map
            key={meta.id}
            id={meta.id}
            className={cn(
              { absolute: viewMode === "overlap" },
              {
                hidden: viewMode === "overlap" && index === 1 && isHideSubMap,
              },
            )}
            opacity={index === 1 && viewMode === "overlap" ? subMapOpacity : 1}
            initialViewState={meta.initialViewState}
            initialMapState={initialMapState}
          />
        ))}
      </div>
      <MapCardFooter />
    </div>
  );
};
