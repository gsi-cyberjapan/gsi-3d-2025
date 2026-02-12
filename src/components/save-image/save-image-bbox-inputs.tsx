"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type SaveImageBBox } from "@/lib/saveImage";

interface SaveImageBBoxInputsProps {
  bbox: SaveImageBBox;
  onChange: (bbox: SaveImageBBox) => void;
}

export const SaveImageBBoxInputs = ({
  bbox,
  onChange,
}: SaveImageBBoxInputsProps) => {
  const handleChange = (key: keyof SaveImageBBox, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      onChange({ ...bbox, [key]: num });
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2 flex flex-col gap-1">
        <Label className="text-xs">北緯</Label>
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
        <Label className="text-xs">西経</Label>
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
        <Label className="text-xs">東経</Label>
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
        <Label className="text-xs">南緯</Label>
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
