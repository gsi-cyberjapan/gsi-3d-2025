"use cliet";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DrawMode, isDrawMode } from "@/hooks/store/drawState";
import { useStore } from "@/hooks/store/useStore";
import {
  ALargeSmall,
  Circle,
  LineSquiggle,
  MapPin,
  Pentagon,
  Slash,
  SquareDashedMousePointer,
} from "lucide-react";
import { ReactElement } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MODES: { value: DrawMode; icon: ReactElement; description: string }[] = [
  { value: "point", icon: <MapPin />, description: "ピンを置く" },
  { value: "circle", icon: <Circle />, description: "円を描く" },
  { value: "linestring", icon: <Slash />, description: "直線を引く" },
  {
    value: "freehand-linestring",
    icon: <LineSquiggle />,
    description: "自由線を描く",
  },
  { value: "polygon", icon: <Pentagon />, description: "多角形を描く" },
  { value: "text", icon: <ALargeSmall />, description: "テキストを置く" },
  {
    value: "select",
    icon: <SquareDashedMousePointer />,
    description: "作画を編集",
  },
];

export const DrawModeSelector = () => {
  const drawMode = useStore((state) => state.drawMode);
  const setDrawMode = useStore((state) => state.setDrawMode);

  const handleDrawModeChane = (value: string) => {
    if (isDrawMode(value)) {
      setDrawMode(value);
    }
  };

  return (
    <Tabs
      value={drawMode}
      onValueChange={handleDrawModeChane}
      className="h-6 rounded-sm"
    >
      <TabsList>
        {MODES.map((m) => (
          <Tooltip key={m.value}>
            <TooltipTrigger asChild>
              <TabsTrigger
                disabled={["text", "point", "select", "polygon"].includes(
                  m.value,
                )}
                className="text-xs size-5 rounded-sm aria-selected:bg-blue-600 dark:aria-selected:text-foreground"
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
