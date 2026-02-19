"use client";

import { useStore } from "@/hooks/store/useStore";
import { CenterInfo } from "@/components/map/center-info";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const ViewFooter = () => {
  const activeMapIds = useStore((state) => state.activeMapIds);
  const layoutMode = useStore((state) => state.layoutMode);
  const footerDisplayMode = useStore((state) => state.footerDisplayMode);
  const setFooterDisplayMode = useStore((state) => state.setFooterDisplayMode);

  const isOpen = footerDisplayMode === "full";

  const handleToggle = () => {
    setFooterDisplayMode(isOpen ? "closed" : "full");
  };

  if (activeMapIds.length === 0) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 bg-background">
      <button
        type="button"
        onClick={handleToggle}
        className="absolute -top-7 left-1/2 -translate-x-1/2 z-10 bg-background border border-b-0 rounded-t px-3 py-1 hover:bg-input transition-colors text-muted-foreground"
        aria-label="フッターの表示を切り替え"
        aria-expanded={isOpen}
        aria-controls="view-footer-panel"
      >
        {isOpen ? (
          <ChevronDown className="size-5" />
        ) : (
          <ChevronUp className="size-5" />
        )}
      </button>
      <div
        id="view-footer-panel"
        className={cn(
          "border-t overflow-hidden grid transition-[grid-template-rows] duration-300",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr] border-t-0",
        )}
      >
        <div className="flex gap-1 py-1 px-1 overflow-hidden">
          <div className="flex flex-1 gap-1">
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
        </div>
      </div>
    </div>
  );
};
