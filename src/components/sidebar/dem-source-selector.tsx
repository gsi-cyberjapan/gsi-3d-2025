"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/hooks/store/useStore";
import { DEM_SOURCES, DemSourceId } from "@/lib/config";

export const DemSourceSelector = () => {
  const selectedDemSourceId = useStore((state) => state.selectedDemSourceId);
  const setSelectedDemSourceId = useStore(
    (state) => state.setSelectedDemSourceId,
  );

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">標高タイル</span>
      <Select
        value={selectedDemSourceId}
        onValueChange={(value) => {
          setSelectedDemSourceId(value as DemSourceId);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DEM_SOURCES.map((source) => (
            <SelectItem key={source.id} value={source.id}>
              {source.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
