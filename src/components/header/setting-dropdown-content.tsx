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
    </DropdownMenuContent>
  );
};
