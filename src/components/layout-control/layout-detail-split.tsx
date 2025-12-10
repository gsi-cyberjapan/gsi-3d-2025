"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/hooks/store/useStore";
import { MapId } from "@/hooks/store/mapManagerState";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";

export const LayoutDetailSplit = () => {
  const focusMapId = useStore((state) => state.focusMapId);
  const setFocusMapId = useStore((state) => state.setFocusMapId);
  const isSyncPosition = useStore((state) => state.isSyncPosition);
  const setIsSyncPosition = useStore((state) => state.setIsSyncPosition);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">操作対象</span>
        <Select value={focusMapId} onValueChange={setFocusMapId}>
          <SelectTrigger size="sm" className="w-full">
            <SelectValue>
              {focusMapId === "main" ? "左の地図" : "右の地図"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(["main", "sub"] as MapId[]).map((id) => (
              <SelectItem key={id} value={id} className="cursor-pointer">
                {id === "main" ? "左の地図" : "右の地図"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">地図の操作</span>
        <Label className="hover:bg-accent/50 flex items-start gap-2 rounded-md border p-2 has-aria-checked:border-blue-600 has-aria-checked:bg-blue-50 dark:has-aria-checked:border-blue-900 dark:has-aria-checked:bg-blue-950 cursor-pointer">
          <Checkbox
            id="sync-position"
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
