"use client";

import { MapBaseData } from "@/lib/getMapBaseDataList";
import { useState } from "react";

interface Props {
  mapBaseData: MapBaseData;
  displayMapType?: boolean;
}

export const MapBaseItem = ({ mapBaseData, displayMapType = false }: Props) => {
  const [isImageError, setIsImageError] = useState(false);

  return (
    <div className="flex gap-2 h-8">
      <div className="relative size-8 rounded-sm overflow-hidden border">
        {isImageError || !URL.canParse(mapBaseData.meta.legendImageUrl) ? (
          <div className="h-full flex items-center justify-center bg-muted">
            {mapBaseData.meta.title.slice(0, 1)}
          </div>
        ) : (
          <img
            src={mapBaseData.meta.legendImageUrl}
            alt={`${mapBaseData.meta.title}のアイコン`}
            onError={() => {
              setIsImageError(true);
            }}
          />
        )}
      </div>
      <div className="flex flex-col justify-center">
        <div className="flex gap-2 items-center">
          <div className="font-semibold">{mapBaseData.meta.title}</div>
          {displayMapType && (
            <span className="text-xs text-muted-foreground">
              {(() => {
                if (mapBaseData.meta.type === "globe") {
                  return "Globe";
                }
                if (mapBaseData.meta.type === "raster") {
                  return "Raster";
                }
                return "Vector";
              })()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
