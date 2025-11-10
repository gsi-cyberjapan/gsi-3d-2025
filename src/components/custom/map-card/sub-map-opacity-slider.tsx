"use client";

import { useGlobalStore } from "@/hooks/store/useGlobalStore";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { stopPropagation } from "@/lib/utils";

export const SubMapOpacitySlider = () => {
  const subMapOpacity = useGlobalStore((state) => state.subMapOpacity);
  const setSubMapOpacity = useGlobalStore((state) => state.setSubMapOpacity);

  const handleOnValueChange = (value: number[]) => {
    setSubMapOpacity(value[0]);
  };

  return (
    <Label className="w-68 bg-background dark:border-input shadow-xs flex gap-2 rounded-md border px-3 h-8 items-center">
      <span>透過率</span>
      <div className="w-0.5 h-4.5 rounded-md bg-border" />
      <div
        onMouseOutCapture={stopPropagation}
        onTouchEndCapture={stopPropagation}
        onClickCapture={stopPropagation}
        className="flex-1"
      >
        <Slider
          className="h-2"
          value={[subMapOpacity]}
          step={0.01}
          max={1}
          min={0}
          onValueChange={handleOnValueChange}
        />
      </div>
      <span>{subMapOpacity.toFixed(2)}</span>
    </Label>
  );
};
