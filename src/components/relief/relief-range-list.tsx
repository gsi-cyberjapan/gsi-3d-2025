"use client";

import { useStore } from "@/hooks/store/useStore";
import { ReliefRangeItem } from "./relief-range-item";
import { useMemo } from "react";

export const ReliefRangeList = () => {
  const elevationRanges = useStore((state) => state.elevationRanges);
  const updateElevationRange = useStore((state) => state.updateElevationRange);
  const removeElevationRange = useStore((state) => state.removeElevationRange);

  // Sort ranges by elevation descending for display
  const sortedRanges = useMemo(() => {
    return [...elevationRanges].sort((a, b) => b.minElevation - a.minElevation);
  }, [elevationRanges]);

  const canRemove = elevationRanges.length > 2;

  return (
    <div className="flex flex-col gap-1.5 max-h-60 scrollbar-transparent-thin">
      {sortedRanges.map((range, index) => {
        const isHighest = index === 0;
        const isLowest = index === sortedRanges.length - 1;
        // For display: show upper bound from the previous item (higher elevation)
        const upperBound = isHighest
          ? null
          : (sortedRanges[index - 1]?.minElevation ?? null);

        return (
          <ReliefRangeItem
            key={range.id}
            range={range}
            nextElevation={upperBound}
            isHighest={isHighest}
            isLowest={isLowest}
            canRemove={canRemove}
            onColorChange={(color) => {
              updateElevationRange(range.id, { color });
            }}
            onElevationChange={(minElevation) => {
              updateElevationRange(range.id, { minElevation });
            }}
            onRemove={() => {
              removeElevationRange(range.id);
            }}
          />
        );
      })}
    </div>
  );
};
