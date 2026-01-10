"use client";

import { Popover, PopoverContent } from "./popover";
import {
  ColorPicker,
  ColorPickerEyeDropper,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerOutput,
  ColorPickerFormat,
} from "./shadcn-io/color-picker";
import { FormEventHandler } from "react";
import Color from "color";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { useState } from "react";

interface ColorPickerPopover {
  value: string;
  onValueChange:
    | (FormEventHandler<HTMLDivElement> &
        ((value: Parameters<typeof Color.rgb>[0]) => void))
    | undefined;
}

export const ColorPickerPopover = ({
  value,
  onValueChange,
}: ColorPickerPopover) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <div className="rounded-md border size-6" />
      </PopoverTrigger>
      <PopoverContent>
        <ColorPicker
          className="max-w-sm rounded-md border bg-background p-4 shadow-sm h-100"
          value={value}
          onChange={onValueChange}
        >
          <div className="flex items-center gap-4">
            <ColorPickerEyeDropper />
            <div className="grid w-full gap-1">
              <ColorPickerHue />
              <ColorPickerAlpha />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ColorPickerOutput />
            <ColorPickerFormat />
          </div>
        </ColorPicker>
      </PopoverContent>
    </Popover>
  );
};
