"use client";

import { useStore } from "@/hooks/store/useStore";
import { useDrawFeatures } from "@/hooks/useDrawFeatures";
import { Window } from "../ui/window";
import { DrawModeSelector } from "./draw-mode-selector";
import { DrawFileButton } from "./draw-file-button";
import { FeatureSourceList } from "./feature-source-list";
import { Separator } from "@/components/ui/separator";

export const DrawWindow = () => {
  const isDrawWindowOpen = useStore((state) => state.isDrawWindowOpen);
  const setIsDrawWindowOpen = useStore((state) => state.setIsDrawWindowOpen);
  const featureGroups = useDrawFeatures();

  return (
    <Window
      title="作図"
      isOpen={isDrawWindowOpen}
      onClose={() => {
        setIsDrawWindowOpen(false);
      }}
    >
      <div className="grid gap-2">
        <div className="flex gap-2 justify-between">
          <DrawFileButton />
          <DrawModeSelector />
        </div>
        {featureGroups.length > 0 && (
          <>
            <Separator />
            <FeatureSourceList />
          </>
        )}
      </div>
    </Window>
  );
};
