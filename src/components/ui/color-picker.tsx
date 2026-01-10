"use client";

import { useMemo } from "react";
import Color from "color";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import {
  ColorPicker as IoColorPicker,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
  type ColorPickerProps as IoColorPickerProps,
} from "@/components/ui/shadcn-io/color-picker";
import { cn } from "@/lib/utils";

export interface ColorPickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (color: string) => void;
  disabled?: boolean;
  className?: string;
}

export const ColorPicker = ({
  value,
  defaultValue = "#000000",
  onChange,
  disabled = false,
  className,
}: ColorPickerProps) => {
  // Convert color string to display color with opacity
  const displayColor = useMemo(() => {
    try {
      const color = Color(value || defaultValue);
      // Always use hexa format to preserve alpha
      return color.hexa();
    } catch {
      return defaultValue;
    }
  }, [value, defaultValue]);

  // Handle color change from the picker
  const handleChange: IoColorPickerProps["onChange"] = (rgba) => {
    if (onChange && rgba) {
      const [r, g, b, a] = rgba as [number, number, number, number];
      const color = Color.rgb(r, g, b).alpha(a);
      // Use hexa format to preserve alpha channel
      onChange(color.hexa());
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "size-8 rounded-md border border-input transition-colors",
            "hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          style={{ backgroundColor: displayColor }}
          aria-label="色を選択"
        />
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <IoColorPicker
          className="max-w-sm rounded-md border p-4 shadow-sm h-80"
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
        >
          <ColorPickerSelection />
          <div className="flex items-center gap-4">
            <ColorPickerEyeDropper />
            <div className="grid w-full gap-1">
              <ColorPickerHue />
              <ColorPickerAlpha />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* <ColorPickerOutput /> */}
            <ColorPickerFormat />
          </div>
        </IoColorPicker>
      </PopoverContent>
    </Popover>
  );
};
