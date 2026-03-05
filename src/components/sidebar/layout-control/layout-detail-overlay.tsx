"use client";

import { useStore } from "@/hooks/store/useStore";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const LayoutDetailOverlay = () => {
  const overlaySliderPosition = useStore(
    (state) => state.overlaySliderPosition,
  );
  const setOverlaySliderPosition = useStore(
    (state) => state.setOverlaySliderPosition,
  );
  const isSyncPosition = useStore((state) => state.isSyncPosition);
  const setIsSyncPosition = useStore((state) => state.setIsSyncPosition);

  const handleSliderChange = (value: number[]) => {
    setOverlaySliderPosition(value[0]);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">スライダーの位置</span>
        <div className="flex gap-2 items-center">
          <Slider
            value={[overlaySliderPosition]}
            onValueChange={handleSliderChange}
            max={0.95}
            min={0.05}
            step={0.01}
          />
          <div className="w-10 text-sm text-right">
            {String(Math.round(overlaySliderPosition * 100))}%
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">地図の操作</span>
        <Label className="hover:bg-accent/50 flex items-start gap-2 rounded-md border p-2 has-aria-checked:border-blue-600 has-aria-checked:bg-blue-50 dark:has-aria-checked:border-blue-900 dark:has-aria-checked:bg-blue-950 cursor-pointer">
          <Checkbox
            id="overlay-sync-position"
            checked={isSyncPosition}
            onCheckedChange={setIsSyncPosition}
            className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
          />
          <div className="grid gap-1 font-normal">
            <p className="text-sm leading-none">位置を連動</p>
            <p className="text-muted-foreground text-xs">
              左と右の地図の位置が連動します
            </p>
          </div>
        </Label>
      </div>
    </div>
  );
};
