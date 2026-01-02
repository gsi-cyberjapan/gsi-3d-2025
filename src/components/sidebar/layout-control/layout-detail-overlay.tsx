"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/hooks/store/useStore";
import { MapId } from "@/hooks/store/mapManagerState";
import { Slider } from "@/components/ui/slider";

export const LayoutDetailOverlay = () => {
  const focusMapId = useStore((state) => state.focusMapId);
  const setFocusMapId = useStore((state) => state.setFocusMapId);
  const subMapOpacity = useStore((state) => state.subMapOpacityOnOverlay);
  const setSubMapOpacity = useStore((state) => state.setSubMapOpacityOnOverlay);

  const handleSliderChange = (value: number[]) => {
    setSubMapOpacity(value[0]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">操作対象</span>
        <Select value={focusMapId} onValueChange={setFocusMapId}>
          <SelectTrigger size="sm" className="w-full">
            <SelectValue>
              {focusMapId === "main" ? "背面の地図" : "手前の地図"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(["main", "sub"] as MapId[]).map((id) => (
              <SelectItem key={id} value={id} className="cursor-pointer">
                {id === "main" ? "背面の地図" : "手前の地図"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">
          手前の地図の透過率
        </span>
        <div className="flex gap-2 items-center">
          <Slider
            value={[subMapOpacity]}
            onValueChange={handleSliderChange}
            max={1}
            step={0.01}
          />
          <div className="w-10 text-sm text-right">
            {subMapOpacity.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};
