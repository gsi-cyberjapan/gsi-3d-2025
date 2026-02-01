"use client";

import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/hooks/store/useStore";

export const SettingDropdownContent = () => {
  const isDisplayCenterLine = useStore((state) => state.isDisplayCenterLine);
  const setIsDisplayCenterLine = useStore(
    (state) => state.setIsDisaplayCenterLine,
  );
  const isClickToMoveEnabled = useStore((state) => state.isClickToMoveEnabled);
  const setIsClickToMoveEnabled = useStore(
    (state) => state.setIsClickToMoveEnabled,
  );

  return (
    <DropdownMenuContent className="w-56" align="end">
      <DropdownMenuGroup>
        <DropdownMenuLabel className="text-sm">表示</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={isDisplayCenterLine}
          onCheckedChange={setIsDisplayCenterLine}
          className="text-sm cursor-pointer"
        >
          中心十字線
        </DropdownMenuCheckboxItem>
      </DropdownMenuGroup>
      <DropdownMenuGroup>
        <DropdownMenuLabel className="text-sm">操作</DropdownMenuLabel>
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
