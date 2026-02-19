"use client";

import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { useStore } from "@/hooks/store/useStore";
import { FeatureInfoPopover } from "./feature-info-popover";

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
  const isDenshi3dEnabled = useStore(
    (state) => state.maps[focusMapId].isDenshi3dEnabled,
  );
  const setHillshadeEnabled = useStore((state) => state.setHillshadeEnabled);
  const setTerrainEnabled = useStore((state) => state.setTerrainEnabled);
  const setPointCloudEnabled = useStore((state) => state.setPointCloudEnabled);
  const setDenshi3dEnabled = useStore((state) => state.setDenshi3dEnabled);

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
      info: {
        title: "陰影",
        description:
          "北西から光を当てたように地形の凹凸を表現します。尾根線や谷線の判別に活用できます。",
      },
    },
    {
      label: "地形の立体表示",
      checked: isTerrainEnabled,
      onChange: () => {
        setTerrainEnabled({
          mapId: focusMapId,
          enabled: !isTerrainEnabled,
        });
      },
      info: {
        title: "地形の立体表示",
        description:
          "標高データを用いて地形を立体的に表示します。地形の起伏を直感的に把握できます。",
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
      info: {
        title: "点群",
        description:
          "航空レーザ測量により取得した3次元点群データを表示します。建物や樹木を含む詳細な地表面の高さ情報を確認できます。",
        links: [
          {
            label: "点群データについて",
            url: "https://www.gsi.go.jp/gazochosa/tengun.html",
          },
        ],
      },
    },
    {
      label: "3次元地図",
      checked: isDenshi3dEnabled,
      onChange: () => {
        setDenshi3dEnabled({
          mapId: focusMapId,
          enabled: !isDenshi3dEnabled,
        });
      },
      info: {
        title: "3次元地図",
        description:
          "電子国土基本図に高さ情報を付与した3次元データです。建物や道路、鉄道を立体的に表示します。",
        links: [
          {
            label: "3次元電子国土基本図について",
            url: "https://www.gsi.go.jp/kibanjoho/mapinfo3D.html",
          },
        ],
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
          <div className="grid gap-1.5 font-normal flex-1">
            <p className="text-sm leading-none font-normal">{toggle.label}</p>
          </div>
          <FeatureInfoPopover
            title={toggle.info.title}
            description={toggle.info.description}
            links={toggle.info.links}
          />
        </Label>
      ))}
    </>
  );
};
