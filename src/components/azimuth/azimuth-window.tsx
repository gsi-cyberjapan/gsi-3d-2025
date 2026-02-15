"use client";

import { useStore } from "@/hooks/store/useStore";
import { Window } from "@/components/ui/window";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { InputColor } from "@/components/ui/input-color-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type LineDashType = "solid" | "dashed" | "dotted";

const lineDashToType = (dash: number[]): LineDashType => {
  if (dash.length === 0) return "solid";
  if (dash[0] === 2) return "dotted";
  return "dashed";
};

const typeToLineDash = (type: LineDashType): number[] => {
  switch (type) {
    case "solid":
      return [];
    case "dashed":
      return [5, 5];
    case "dotted":
      return [2, 2];
  }
};

export const AzimuthWindow = () => {
  const isOpen = useStore((state) => state.isAzimuthWindowOpen);
  const setIsOpen = useStore((state) => state.setIsAzimuthWindowOpen);
  const distance = useStore((state) => state.azimuthDistance);
  const setDistance = useStore((state) => state.setAzimuthDistance);
  const unit = useStore((state) => state.azimuthUnit);
  const setUnit = useStore((state) => state.setAzimuthUnit);
  const interval = useStore((state) => state.azimuthInterval);
  const setInterval = useStore((state) => state.setAzimuthInterval);
  const color = useStore((state) => state.azimuthColor);
  const setColor = useStore((state) => state.setAzimuthColor);
  const lineWidth = useStore((state) => state.azimuthLineWidth);
  const setLineWidth = useStore((state) => state.setAzimuthLineWidth);
  const lineDash = useStore((state) => state.azimuthLineDash);
  const setLineDash = useStore((state) => state.setAzimuthLineDash);

  const displayValue = unit === "km" ? distance / 1000 : distance;

  const handleDistanceChange = (value: string) => {
    const num = Number.parseFloat(value);
    if (Number.isNaN(num) || num <= 0) return;
    const meters = unit === "km" ? num * 1000 : num;
    setDistance(meters);
  };

  const handleUnitChange = (newUnit: "m" | "km") => {
    setUnit(newUnit);
  };

  return (
    <Window
      title="方位線"
      className="w-72"
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
      }}
    >
      <div className="grid gap-3">
        <p className="text-xs text-muted-foreground">
          地図をクリックして中心点を設定してください
        </p>

        <Separator />

        {/* Distance */}
        <div className="flex items-center gap-2">
          <Label className="text-xs shrink-0">距離:</Label>
          <Input
            type="number"
            className="h-7 w-20 text-sm"
            value={displayValue}
            onChange={(e) => {
              handleDistanceChange(e.target.value);
            }}
            min={unit === "km" ? 0.1 : 100}
            step={unit === "km" ? 0.5 : 100}
          />
          <Select value={unit} onValueChange={handleUnitChange}>
            <SelectTrigger className="h-7 w-18" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="m">m</SelectItem>
              <SelectItem value="km">km</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Interval */}
        <div className="flex items-center gap-2">
          <Label className="text-xs shrink-0">間隔:</Label>
          <Select
            value={String(interval)}
            onValueChange={(value) => {
              setInterval(Number.parseInt(value));
            }}
          >
            <SelectTrigger className="h-7 flex-1" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15°</SelectItem>
              <SelectItem value="30">30°</SelectItem>
              <SelectItem value="45">45°</SelectItem>
              <SelectItem value="90">90°</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Color */}
        <div className="flex items-center gap-2">
          <Label className="text-xs shrink-0">色:</Label>
          <InputColor value={color} onChange={setColor} />
        </div>

        {/* Line Width */}
        <div className="flex items-center gap-2">
          <Label className="text-xs shrink-0">線の太さ:</Label>
          <Slider
            className="flex-1"
            value={[lineWidth]}
            onValueChange={(values) => {
              setLineWidth(values[0]);
            }}
            min={1}
            max={5}
            step={1}
          />
          <span className="text-xs text-muted-foreground w-4 text-right">
            {lineWidth}
          </span>
        </div>

        {/* Line Style */}
        <div className="flex items-center gap-2">
          <Label className="text-xs shrink-0">線の種類:</Label>
          <Select
            value={lineDashToType(lineDash)}
            onValueChange={(value: LineDashType) => {
              setLineDash(typeToLineDash(value));
            }}
          >
            <SelectTrigger className="h-7 flex-1" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">実線</SelectItem>
              <SelectItem value="dashed">破線</SelectItem>
              <SelectItem value="dotted">点線</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Window>
  );
};
