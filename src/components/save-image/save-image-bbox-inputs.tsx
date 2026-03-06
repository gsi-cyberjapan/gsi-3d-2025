"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/hooks/store/useStore";
import { type SaveImageBBox } from "@/lib/saveImage";
import { useCallback } from "react";

export const SaveImageBBoxInputs = () => {
  const bbox = useStore((state) => state.saveImageBBox);
  const setSaveImageBBox = useStore((state) => state.setSaveImageBBox);

  const handleChange = useCallback(
    (key: keyof SaveImageBBox, value: string) => {
      if (!bbox) return;
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setSaveImageBBox({ ...bbox, [key]: num });
      }
    },
    [bbox, setSaveImageBBox],
  );

  if (!bbox) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2 flex flex-col gap-1">
        <Label className="text-xs">北端</Label>
        <Input
          type="number"
          step="0.0001"
          className="h-8 text-xs"
          value={bbox.north}
          onChange={(e) => {
            handleChange("north", e.target.value);
          }}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">西端</Label>
        <Input
          type="number"
          step="0.0001"
          className="h-8 text-xs"
          value={bbox.west}
          onChange={(e) => {
            handleChange("west", e.target.value);
          }}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">東端</Label>
        <Input
          type="number"
          step="0.0001"
          className="h-8 text-xs"
          value={bbox.east}
          onChange={(e) => {
            handleChange("east", e.target.value);
          }}
        />
      </div>
      <div className="col-span-2 flex flex-col gap-1">
        <Label className="text-xs">南端</Label>
        <Input
          type="number"
          step="0.0001"
          className="h-8 text-xs"
          value={bbox.south}
          onChange={(e) => {
            handleChange("south", e.target.value);
          }}
        />
      </div>
    </div>
  );
};
