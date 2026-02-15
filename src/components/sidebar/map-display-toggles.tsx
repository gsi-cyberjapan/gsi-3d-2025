"use client";

import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { useStore } from "@/hooks/store/useStore";

export const MapDisplayToggles = () => {
  const focusMapId = useStore((state) => state.focusMapId);
  const isHillshadeEnabled = useStore(
    (state) => state.maps[focusMapId].isHillshadeEnabled,
  );
  const isTerrainEnabled = useStore(
    (state) => state.maps[focusMapId].isTerrainEnabled,
  );
  const isPointCloudEnabled = useStore(
    (state) => state.maps[focusMapId].isPointCloudEnabled,
  );
  const setHillshadeEnabled = useStore((state) => state.setHillshadeEnabled);
  const setTerrainEnabled = useStore((state) => state.setTerrainEnabled);
  const setPointCloudEnabled = useStore((state) => state.setPointCloudEnabled);

  const toggles = [
    {
      label: "陰影",
      checked: isHillshadeEnabled,
      onChange: () => {
        setHillshadeEnabled({
          mapId: focusMapId,
          enabled: !isHillshadeEnabled,
        });
      },
    },
    {
      label: "立体表示",
      checked: isTerrainEnabled,
      onChange: () => {
        setTerrainEnabled({
          mapId: focusMapId,
          enabled: !isTerrainEnabled,
        });
      },
    },
    {
      label: "点群",
      checked: isPointCloudEnabled,
      onChange: () => {
        setPointCloudEnabled({
          mapId: focusMapId,
          enabled: !isPointCloudEnabled,
        });
      },
    },
  ];

  return (
    <>
      {toggles.map((toggle) => (
        <Label
          key={toggle.label}
          className="rounded-md hover:bg-input/50 bg-input/30 flex items-start gap-3 border p-3 has-aria-checked:border-blue-900 has-aria-checked:bg-blue-950 cursor-pointer h-8 px-3 py-2"
        >
          <Checkbox
            checked={toggle.checked}
            onCheckedChange={toggle.onChange}
            className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
          />
          <div className="grid gap-1.5 font-normal">
            <p className="text-sm leading-none font-normal">{toggle.label}</p>
          </div>
        </Label>
      ))}
    </>
  );
};
