"use client";

import { useGlobalStore } from "@/hooks/store/useGlobalStore";
import { cn } from "@/lib/utils";
import { SlidersHorizontal, Layers2, EyeOff } from "lucide-react";
import { MapCenterInformation } from "./map-center-information";
import { Badge } from "@/components/ui/badge";
import { SubMapOpacitySlider } from "./sub-map-opacity-slider";
import { SubMapHiddenCheck } from "./sub-map-hidden-check";

export const OverlapMapSelector = () => {
  const mapMetas = useGlobalStore((state) => state.mapMetas);
  const controlTargetMapId = useGlobalStore(
    (state) => state.controlTargetMapId,
  );
  const setControlTargetMapId = useGlobalStore(
    (state) => state.setControlTargetMapId,
  );
  const isHideSubmap = useGlobalStore((state) => state.isHideSubmap);

  return (
    <div className="flex flex-col gap-2">
      {mapMetas.toReversed().map((meta, index) => (
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
            <div className="flex flex-col gap-1 items-end">
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
                {isHideSubmap && index === 0 && (
                  <Badge variant="destructive">
                    <EyeOff />
                    非表示中
                  </Badge>
                )}
                <Badge>
                  <Layers2 />
                  {(() => {
                    if (index === 0) {
                      return <span>手前の地図</span>;
                    } else if (index === 1) {
                      return <span>背面の地図</span>;
                    }
                  })()}
                </Badge>
              </div>
              {index === 0 && (
                <div className="flex gap-2">
                  <SubMapHiddenCheck />
                  <SubMapOpacitySlider />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
