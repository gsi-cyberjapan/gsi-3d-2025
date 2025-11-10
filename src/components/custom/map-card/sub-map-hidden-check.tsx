"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useGlobalStore } from "@/hooks/store/useGlobalStore";
import { stopPropagation } from "@/lib/utils";

export const SubMapHiddenCheck = () => {
  const isHideSubMap = useGlobalStore((state) => state.isHideSubmap);
  const setIsHideSubMap = useGlobalStore((state) => state.setIsHideSubmap);

  return (
    <Label
      className="cursor-pointer bg-background dark:border-input shadow-xs flex gap-3 rounded-md border px-3 h-8 items-center has-aria-checked:border-red-600 has-aria-checked:bg-red-50 dark:has-aria-checked:border-red-900 dark:has-aria-checked:bg-red-950"
      onClick={stopPropagation}
    >
      <Checkbox
        checked={isHideSubMap}
        onCheckedChange={setIsHideSubMap}
        className="data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:text-white dark:data-[state=checked]:border-red-700 dark:data-[state=checked]:bg-red-700"
      />
      <div className="grid gap-1.5 font-normal">
        <p className="text-sm leading-none font-medium">地図を非表示</p>
      </div>
    </Label>
  );
};
