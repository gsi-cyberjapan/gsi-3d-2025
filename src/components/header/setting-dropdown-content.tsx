"use client";

import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/hooks/store/useStore";

export const SettingDropdownContent = () => {
  const isDisplayCenterLine = useStore((state) => state.isDisplayCenterLine);
  const setIsDisplayCenterLine = useStore(
    (state) => state.setIsDisplayCenterLine,
  );
  const isDisplayOverview = useStore((state) => state.isDisplayOverview);
  const setIsDisplayOverview = useStore((state) => state.setIsDisplayOverview);
  const isDisplayMagneticNorth = useStore(
    (state) => state.isDisplayMagneticNorth,
  );
  const setIsDisplayMagneticNorth = useStore(
    (state) => state.setIsDisplayMagneticNorth,
  );
  const isClickToMoveEnabled = useStore((state) => state.isClickToMoveEnabled);
  const setIsClickToMoveEnabled = useStore(
    (state) => state.setIsClickToMoveEnabled,
  );

  const isDisplayLatLngGrid = useStore((state) => state.isDisplayLatLngGrid);
  const setIsDisplayLatLngGrid = useStore(
    (state) => state.setIsDisplayLatLngGrid,
  );
  const isDisplayUtmGrid = useStore((state) => state.isDisplayUtmGrid);
  const setIsDisplayUtmGrid = useStore((state) => state.setIsDisplayUtmGrid);
  const isDisplayTileGrid = useStore((state) => state.isDisplayTileGrid);
  const setIsDisplayTileGrid = useStore((state) => state.setIsDisplayTileGrid);
  const isDisplayRegionalMesh = useStore(
    (state) => state.isDisplayRegionalMesh,
  );
  const setIsDisplayRegionalMesh = useStore(
    (state) => state.setIsDisplayRegionalMesh,
  );
  const isDisplayMapSheetNumbers = useStore(
    (state) => state.isDisplayMapSheetNumbers,
  );
  const setIsDisplayMapSheetNumbers = useStore(
    (state) => state.setIsDisplayMapSheetNumbers,
  );

  return (
    <DropdownMenuContent className="w-56" align="end">
      <DropdownMenuGroup>
        <DropdownMenuLabel className="text-sm text-muted-foreground">
          表示
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={isDisplayCenterLine}
          onCheckedChange={setIsDisplayCenterLine}
          className="text-sm cursor-pointer"
        >
          中心十字線
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={isDisplayOverview}
          onCheckedChange={setIsDisplayOverview}
          className="text-sm cursor-pointer"
        >
          広域図
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={isDisplayMagneticNorth}
          onCheckedChange={setIsDisplayMagneticNorth}
          className="text-sm cursor-pointer"
        >
          磁北線
        </DropdownMenuCheckboxItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="text-sm cursor-pointer">
            グリッド表示
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuCheckboxItem
              checked={isDisplayLatLngGrid}
              onCheckedChange={setIsDisplayLatLngGrid}
              className="text-sm cursor-pointer"
            >
              経緯度グリッド
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={isDisplayUtmGrid}
              onCheckedChange={setIsDisplayUtmGrid}
              className="text-sm cursor-pointer"
            >
              UTMグリッド
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={isDisplayTileGrid}
              onCheckedChange={setIsDisplayTileGrid}
              className="text-sm cursor-pointer"
            >
              タイル座標
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={isDisplayRegionalMesh}
              onCheckedChange={setIsDisplayRegionalMesh}
              className="text-sm cursor-pointer"
            >
              地域メッシュ
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={isDisplayMapSheetNumbers}
              onCheckedChange={setIsDisplayMapSheetNumbers}
              className="text-sm cursor-pointer"
            >
              図郭
            </DropdownMenuCheckboxItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuGroup>
      <DropdownMenuGroup>
        <DropdownMenuLabel className="text-sm text-muted-foreground">
          操作
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={isClickToMoveEnabled}
          onCheckedChange={setIsClickToMoveEnabled}
          className="text-sm cursor-pointer"
        >
          クリックで移動
        </DropdownMenuCheckboxItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );
};
