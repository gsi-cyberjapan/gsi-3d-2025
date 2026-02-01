"use client";

import { useStore } from "@/hooks/store/useStore";
import { Window } from "../ui/window";
import { MeasureModeSelector } from "./measure-mode-selector";
import { MeasureResultDisplay } from "./measure-result-display";
import { Separator } from "@/components/ui/separator";

export const MeasureWindow = () => {
  const isMeasureWindowOpen = useStore((state) => state.isMeasureWindowOpen);
  const setIsMeasureWindowOpen = useStore(
    (state) => state.setIsMeasureWindowOpen,
  );

  return (
    <Window
      title="計測"
      className="w-70"
      isOpen={isMeasureWindowOpen}
      onClose={() => {
        setIsMeasureWindowOpen(false);
      }}
    >
      <div className="grid gap-2">
        <div className="flex justify-start">
          <MeasureModeSelector />
        </div>
        <Separator />
        <MeasureResultDisplay />
      </div>
    </Window>
  );
};
