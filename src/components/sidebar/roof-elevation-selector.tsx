"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/hooks/store/useStore";
import { ROOF_ELEVATION_OPTIONS, RoofElevationType } from "@/lib/config";

/**
 * 建物の屋根面標高を選択するセレクタ。
 * 3次元基本図が有効な場合のみ表示される。
 */
export const RoofElevationSelector = () => {
  const focusMapId = useStore((state) => state.focusMapId);
  const isDenshi3dEnabled = useStore(
    (state) => state.maps[focusMapId].isDenshi3dEnabled,
  );
  const roofElevationType = useStore(
    (state) => state.maps[focusMapId].roofElevationType,
  );
  const setRoofElevationType = useStore((state) => state.setRoofElevationType);

  if (!isDenshi3dEnabled) return null;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">建物の屋根面標高</span>
      <Select
        value={roofElevationType}
        onValueChange={(value) => {
          setRoofElevationType({
            mapId: focusMapId,
            roofElevationType: value as RoofElevationType,
          });
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROOF_ELEVATION_OPTIONS.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
