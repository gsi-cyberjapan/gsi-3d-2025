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

export const EquidistantCirclesWindow = () => {
  const isOpen = useStore((state) => state.isEquidistantCirclesWindowOpen);
  const setIsOpen = useStore(
    (state) => state.setIsEquidistantCirclesWindowOpen,
  );
  const interval = useStore((state) => state.equidistantCirclesInterval);
  const setInterval = useStore((state) => state.setEquidistantCirclesInterval);
  const unit = useStore((state) => state.equidistantCirclesUnit);
  const setUnit = useStore((state) => state.setEquidistantCirclesUnit);
  const count = useStore((state) => state.equidistantCirclesCount);
  const setCount = useStore((state) => state.setEquidistantCirclesCount);
  const color = useStore((state) => state.equidistantCirclesColor);
  const setColor = useStore((state) => state.setEquidistantCirclesColor);
  const lineWidth = useStore((state) => state.equidistantCirclesLineWidth);
  const setLineWidth = useStore(
    (state) => state.setEquidistantCirclesLineWidth,
  );
  const lineDash = useStore((state) => state.equidistantCirclesLineDash);
  const setLineDash = useStore((state) => state.setEquidistantCirclesLineDash);

  const displayValue = unit === "km" ? interval / 1000 : interval;

  const handleIntervalChange = (value: string) => {
    const num = Number.parseFloat(value);
    if (Number.isNaN(num) || num <= 0) return;
    const meters = unit === "km" ? num * 1000 : num;
    setInterval(meters);
  };

  const handleUnitChange = (newUnit: "m" | "km") => {
    setUnit(newUnit);
  };

  const handleCountChange = (value: string) => {
    const num = Number.parseInt(value);
    if (Number.isNaN(num) || num < 1 || num > 20) return;
    setCount(num);
  };

  return (
    <Window
      title="等距圏"
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

        {/* Interval */}
        <div className="flex items-center gap-2">
          <Label className="text-xs shrink-0">間隔:</Label>
          <Input
            type="number"
            className="h-7 w-20 text-sm"
            value={displayValue}
            onChange={(e) => {
              handleIntervalChange(e.target.value);
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

        {/* Count */}
        <div className="flex items-center gap-2">
          <Label className="text-xs shrink-0">本数:</Label>
          <Input
            type="number"
            className="h-7 w-20 text-sm"
            value={count}
            onChange={(e) => {
              handleCountChange(e.target.value);
            }}
            min={1}
            max={20}
          />
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
