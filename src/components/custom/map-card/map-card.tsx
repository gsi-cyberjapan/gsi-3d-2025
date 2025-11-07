"use client";

import { Map } from "./map";
import { useGlobalStore } from "@/hooks/store/useGlobalStore";
import { cn } from "@/lib/utils";

export const MapCard = () => {
  const viewMode = useGlobalStore((state) => state.viewMode);
  const subMapOpacity = useGlobalStore((state) => state.subMapOpacity);
  const mapMetas = useGlobalStore((state) => state.mapMetas);

  return (
    <div className="w-full h-full flex gap-1 rounded-md overflow-hidden border relative">
      {mapMetas.map((meta, index) => (
        <Map
          key={meta.id}
          id={meta.id}
          className={cn({ absolute: viewMode === "overlap" })}
          opacity={index === 1 && viewMode === "overlap" ? subMapOpacity : 1}
          initialViewState={meta.initialViewState}
        />
      ))}
    </div>
  );
};
