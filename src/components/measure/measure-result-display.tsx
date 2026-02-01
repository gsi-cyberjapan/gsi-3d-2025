"use client";

import { useStore } from "@/hooks/store/useStore";
import { formatDistance, formatArea } from "@/lib/measure/formatMeasurement";

export const MeasureResultDisplay = () => {
  const currentMeasurement = useStore((state) => state.currentMeasurement);
  const measureMode = useStore((state) => state.measureMode);

  if (currentMeasurement === null) {
    return (
      <div className="text-muted-foreground text-xs py-2">
        {measureMode === "distance"
          ? "地図上をクリックして線を引いてください"
          : "地図上をクリックして多角形を描いてください"}
      </div>
    );
  }

  const formattedValue =
    measureMode === "distance"
      ? formatDistance(currentMeasurement)
      : formatArea(currentMeasurement);

  return (
    <div className="flex items-center gap-3 py-0.5">
      <div className="text-xs text-muted-foreground">
        {measureMode === "distance" ? "距離" : "面積"}
      </div>
      <div className="text-lg font-semibold">{formattedValue}</div>
    </div>
  );
};
