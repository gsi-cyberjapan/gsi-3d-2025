"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MeasureMode } from "@/hooks/store/measureState";
import { useStore } from "@/hooks/store/useStore";
import { Ruler, Grid2x2 } from "lucide-react";
import { ReactElement } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MODES: { value: MeasureMode; icon: ReactElement; description: string }[] =
  [
    { value: "distance", icon: <Ruler />, description: "距離を計測" },
    { value: "area", icon: <Grid2x2 />, description: "面積を計測" },
  ];

const isMeasureMode = (v: string): v is MeasureMode => {
  return v === "distance" || v === "area";
};

export const MeasureModeSelector = () => {
  const measureMode = useStore((state) => state.measureMode);
  const setMeasureMode = useStore((state) => state.setMeasureMode);

  const handleMeasureModeChange = (value: string) => {
    if (isMeasureMode(value)) {
      setMeasureMode(value);
    }
  };

  return (
    <Tabs
      value={measureMode}
      onValueChange={handleMeasureModeChange}
      className="h-6 rounded-sm"
    >
      <TabsList>
        {MODES.map((m) => (
          <Tooltip key={m.value}>
            <TooltipTrigger asChild>
              <TabsTrigger
                className="text-xs size-5 rounded-sm aria-selected:bg-orange-600 dark:aria-selected:text-foreground"
                value={m.value}
              >
                {m.icon}
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent className="z-30">
              <p>{m.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TabsList>
    </Tabs>
  );
};
