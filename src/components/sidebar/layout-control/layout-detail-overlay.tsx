"use client";

import { useStore } from "@/hooks/store/useStore";
import { Slider } from "@/components/ui/slider";

export const LayoutDetailOverlay = () => {
  const subMapOpacity = useStore((state) => state.subMapOpacityOnOverlay);
  const setSubMapOpacity = useStore((state) => state.setSubMapOpacityOnOverlay);

  const handleSliderChange = (value: number[]) => {
    setSubMapOpacity(value[0]);
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">手前の地図の透過率</span>
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
  );
};
