"use client";

import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { useStore } from "@/hooks/store/useStore";
import { FeatureInfoPopover } from "./feature-info-popover";

export const GlobeModeCheckbox = () => {
  const focusMapId = useStore((state) => state.focusMapId);
  const projection = useStore((state) => state.maps[focusMapId].projection);
  const setProjection = useStore((state) => state.setProjection);

  const handleChecked = () => {
    setProjection({
      mapId: focusMapId,
      mode: projection === "globe" ? "mercator" : "globe",
    });
  };

  return (
    <Label className="rounded-md hover:bg-input/50 bg-input/30 flex items-start gap-3 border p-3 has-aria-checked:border-blue-900 has-aria-checked:bg-blue-950 cursor-pointer h-8 px-3 py-2">
      <Checkbox
        checked={projection === "globe"}
        onCheckedChange={handleChecked}
        className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
      />
      <div className="grid gap-1.5 font-normal flex-1">
        <p className="text-sm leading-none font-normal">Globe表示</p>
      </div>
      <FeatureInfoPopover
        title="Globe表示"
        description="地図や空中写真を地球儀のように3次元で表示します。地形や地表の状況を直感的に理解できます。"
      />
    </Label>
  );
};
