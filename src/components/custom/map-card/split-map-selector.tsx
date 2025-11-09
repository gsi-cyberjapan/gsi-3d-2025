"use client";

import { useGlobalStore } from "@/hooks/store/useGlobalStore";
import { MapCenterInformation } from "./map-center-information";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";

export const SplitMapSeceltor = () => {
  const mapMetas = useGlobalStore((state) => state.mapMetas);
  const controlTargetMapId = useGlobalStore(
    (state) => state.controlTargetMapId,
  );
  const setControlTargetMapId = useGlobalStore(
    (state) => state.setControlTargetMapId,
  );

  return (
    <div className="flex gap-1">
      {mapMetas.map((meta) => (
        <div
          key={meta.id}
          role="button"
          tabIndex={0}
          className="cursor-pointer w-full pr-1 transition-colors rounded-md hover:bg-muted focus-visible:ring"
          onClick={() => {
            setControlTargetMapId(meta.id);
          }}
        >
          <div className="flex justify-between">
            <div className="flex gap-2">
              <div
                className={cn("w-1 h-full rounded-full", {
                  "bg-blue-500 dark:bg-blue-600":
                    controlTargetMapId === meta.id,
                  "bg-muted-foreground": controlTargetMapId !== meta.id,
                })}
              />
              <MapCenterInformation mapId={meta.id} />
            </div>
            <div className="flex gap-2 h-fit py-1">
              {controlTargetMapId === meta.id && (
                <Badge
                  variant="secondary"
                  className="bg-blue-500 text-white dark:bg-blue-600"
                >
                  <SlidersHorizontal />
                  設定中
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
