"use client";

import { useStore } from "@/hooks/store/useStore";
import { CenterInfo } from "./center-info";

export const ViewFooter = () => {
  const activeMapIds = useStore((state) => state.activeMapIds);
  const layoutMode = useStore((state) => state.layoutMode);

  return (
    <div className="flex gap-1 p-1">
      {(() => {
        if (layoutMode === "split") {
          return activeMapIds.map((id) => (
            <div key={id} className="w-full">
              <CenterInfo mapId={id} />
            </div>
          ));
        }
        return <CenterInfo mapId={activeMapIds[0]} />;
      })()}
    </div>
  );
};
