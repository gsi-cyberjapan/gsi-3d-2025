"use client";

import { useStore } from "@/hooks/store/useStore";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, RotateCcw } from "lucide-react";
import { COLOR_PATTERNS } from "@/lib/relief/colorPatterns";

export const ReliefControls = () => {
  const selectedPatternId = useStore((state) => state.selectedPatternId);
  const applyColorPattern = useStore((state) => state.applyColorPattern);
  const isHillshadeEnabled = useStore((state) => state.isHillshadeEnabled);
  const setIsHillshadeEnabled = useStore(
    (state) => state.setIsHillshadeEnabled,
  );
  const isGradientEnabled = useStore((state) => state.isGradientEnabled);
  const setIsGradientEnabled = useStore((state) => state.setIsGradientEnabled);
  const addElevationRange = useStore((state) => state.addElevationRange);
  const resetToDefaults = useStore((state) => state.resetToDefaults);

  return (
    <div className="flex flex-col gap-2">
      {/* Color Pattern Selector */}
      <div className="flex items-center gap-2">
        <Label className="text-xs shrink-0">カラーパターン:</Label>
        <Select value={selectedPatternId} onValueChange={applyColorPattern}>
          <SelectTrigger className="h-7 flex-1" size="sm">
            <SelectValue placeholder="パターンを選択" />
          </SelectTrigger>
          <SelectContent>
            {COLOR_PATTERNS.map((pattern) => (
              <SelectItem key={pattern.id} value={pattern.id}>
                {pattern.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hillshade Toggle */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Label className="hover:bg-accent/50 flex px-2 gap-2 rounded-md border h-7 items-center has-aria-checked:border-blue-600 has-aria-checked:bg-blue-50 dark:has-aria-checked:border-blue-900 dark:has-aria-checked:bg-blue-950 dark:bg-input/30 cursor-pointer">
          <Checkbox
            id="hillshade"
            checked={isHillshadeEnabled}
            onCheckedChange={setIsHillshadeEnabled}
            className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
          />
          <p className="text-sm leading-none">陰影</p>
        </Label>
        <Label className="hover:bg-accent/50 flex px-2 gap-2 rounded-md border h-7 items-center has-aria-checked:border-blue-600 has-aria-checked:bg-blue-50 dark:has-aria-checked:border-blue-900 dark:has-aria-checked:bg-blue-950 dark:bg-input/30 cursor-pointer">
          <Checkbox
            id="gradient"
            checked={isGradientEnabled}
            onCheckedChange={setIsGradientEnabled}
            className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
          />
          <p className="text-sm leading-none">グラデーション</p>
        </Label>
        <Button variant="outline" size="xs" onClick={addElevationRange}>
          <Plus className="size-3.5" />
          追加
        </Button>
        <Button variant="outline" size="xs" onClick={resetToDefaults}>
          <RotateCcw className="size-3.5" />
          リセット
        </Button>
      </div>
    </div>
  );
};
