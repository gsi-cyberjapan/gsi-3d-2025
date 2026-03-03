"use client";

import { useStore } from "@/hooks/store/useStore";
import { formatDistance, formatArea } from "@/lib/measure/formatMeasurement";
import { Button } from "@/components/ui/button";
import { Trash2, Ruler, Grid2x2 } from "lucide-react";

export const MeasureHistoryList = () => {
  const measureResults = useStore((state) => state.measureResults);
  const removeMeasureResult = useStore((state) => state.removeMeasureResult);
  const td = useStore((state) => state.maps.main.td);
  const subTd = useStore((state) => state.maps.sub.td);

  const handleRemove = (
    id: string,
    featureId: string | number,
    mapId: string,
  ) => {
    const targetTd = mapId === "main" ? td : subTd;
    if (targetTd) {
      try {
        targetTd.removeFeatures([featureId]);
      } catch {
        // Feature may already be removed
      }
    }
    removeMeasureResult(id);
  };

  if (measureResults.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-1">
      <div className="text-xs text-muted-foreground">計測履歴</div>
      <ul className="grid gap-0.5">
        {measureResults.map((result) => (
          <li
            key={result.id}
            className="flex items-center justify-between gap-2 rounded px-1.5 py-1 text-xs hover:bg-accent"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              {result.type === "distance" ? (
                <Ruler className="size-3 shrink-0 text-muted-foreground" />
              ) : (
                <Grid2x2 className="size-3 shrink-0 text-muted-foreground" />
              )}
              <span className="truncate font-medium">
                {result.type === "distance"
                  ? formatDistance(result.value)
                  : formatArea(result.value)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-5 shrink-0"
              onClick={() => {
                handleRemove(result.id, result.featureId, result.mapId);
              }}
            >
              <Trash2 className="size-3" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};
