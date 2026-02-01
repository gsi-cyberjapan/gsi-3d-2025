"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { ReliefColorButton } from "./relief-color-button";
import type { ElevationRange } from "@/lib/relief/colorPatterns";

interface ReliefRangeItemProps {
  range: ElevationRange;
  nextElevation: number | null;
  onColorChange: (color: string) => void;
  onElevationChange: (elevation: number) => void;
  onRemove: () => void;
  canRemove: boolean;
  isHighest: boolean;
  isLowest: boolean;
}

export const ReliefRangeItem = ({
  range,
  nextElevation,
  onColorChange,
  onElevationChange,
  onRemove,
  canRemove,
  isHighest,
  isLowest,
}: ReliefRangeItemProps) => {
  const handleElevationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      onElevationChange(value);
    }
  };

  // Format range label suffix
  const getRangeSuffix = () => {
    if (isLowest) {
      return "m 以下";
    }
    if (isHighest) {
      return "m 以上";
    }
    if (nextElevation !== null) {
      return `- ${String(nextElevation)} m`;
    }
    return "m 以上";
  };

  return (
    <div className="flex items-center gap-2">
      <ReliefColorButton value={range.color} onChange={onColorChange} />
      <div className="flex items-center gap-1 flex-1">
        <Input
          type="number"
          value={range.minElevation}
          onChange={handleElevationChange}
          className="w-20 h-7 text-xs text-right"
          min={0}
        />
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {getRangeSuffix()}
        </span>
      </div>
      {canRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0"
          onClick={onRemove}
        >
          <Trash2 className="size-3.5" />
        </Button>
      )}
    </div>
  );
};
