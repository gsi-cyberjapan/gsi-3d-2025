"use client";

import { Map } from "./map";
import { useGlobalStore } from "@/hooks/store/useGlobalStore";
import { cn } from "@/lib/utils";

export const MapCard = () => {
  const viewMode = useGlobalStore((state) => state.viewMode);
  const mapMetas = useGlobalStore((state) => state.mapMetas);

  return (
    <div className="w-full h-full flex gap-1 rounded-md overflow-hidden border relative">
      {mapMetas.map((meta) => (
        <Map
          key={meta.id}
          id={meta.id}
          className={cn({ absolute: viewMode === "overlap" })}
          initialViewState={meta.initialViewState}
        />
      ))}
    </div>
  );
};
