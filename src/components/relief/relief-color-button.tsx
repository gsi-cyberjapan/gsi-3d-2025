"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";

interface ReliefColorButtonProps {
  value: string;
  onChange: (value: string) => void;
}

export const ReliefColorButton = ({
  value,
  onChange,
}: ReliefColorButtonProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="border-border size-6 border shadow-none shrink-0"
          size="icon"
          style={{ backgroundColor: value }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <HexColorPicker
          className="!h-[200px] !w-[200px]"
          color={value}
          onChange={onChange}
        />
      </PopoverContent>
    </Popover>
  );
};
