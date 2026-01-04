"use client";

import { useStore } from "@/hooks/store/useStore";
import { Window } from "../ui/window";
import { DrawModeSelector } from "./draw-mode-selector";
import { DrawFileButton } from "./draw-file-button";

export const DrawWindow = () => {
  const isDrawWindowOpen = useStore((state) => state.isDrawWindowOpen);
  const setIsDrawWindowOpen = useStore((state) => state.setIsDrawWindowOpen);

  return (
    <Window
      title="作図"
      isOpen={isDrawWindowOpen}
      onClose={() => {
        setIsDrawWindowOpen(false);
      }}
    >
      <div className="grid gap-2">
        <div className="flex gap-2">
          <DrawFileButton />
          <DrawModeSelector />
        </div>
      </div>
    </Window>
  );
};
