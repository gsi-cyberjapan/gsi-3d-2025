"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useGlobalStore } from "@/hooks/store/useGlobalStore";
import {
  MAP_VIEW_MODES,
  type MapViewMode,
} from "@/hooks/store/createMapCardSlice";
import {
  MapIcon,
  Check,
  ChevronsUpDown,
  SquareSplitHorizontal,
  Layers2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MAP_CONFIG } from "@/lib/config";
import { useMap } from "@vis.gl/react-maplibre";

export const MapViewModeSelect = () => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const viewMode = useGlobalStore((state) => state.viewMode);
  const setViewMode = useGlobalStore((state) => state.setViewMode);
  const maps = useMap();

  const handleModeSelect = (value: string) => {
    if (value === viewMode) {
      setIsPopoverOpen(false);
      return;
    }
    const primaryMap = maps[MAP_CONFIG.MAP_PRIMARY.ID]?.getMap();
    if (!primaryMap) {
      console.error("Failed to retrieve the primary map instance.");
      setIsPopoverOpen(false);
      return;
    }

    if (value === "single") {
      setViewMode({ viewMode: value });
    } else if (value === "split" || value === "overlap") {
      const primaryMapCenter = primaryMap.getCenter();
      setViewMode({
        viewMode: value,
        newMapnitialViewState: {
          latitude: primaryMapCenter.lat,
          longitude: primaryMapCenter.lng,
          zoom: primaryMap.getZoom(),
        },
      });
    }
    setIsPopoverOpen(false);
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isPopoverOpen}
          className="w-45 justify-between"
          size="sm"
        >
          <MapViewModeSelectItem viewMode={viewMode} />
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-45 p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {MAP_VIEW_MODES.map((mode) => {
                return (
                  <CommandItem
                    key={mode}
                    value={mode}
                    onSelect={handleModeSelect}
                  >
                    <MapViewModeSelectItem viewMode={mode} />
                    <Check
                      className={cn(
                        "ml-auto",
                        viewMode === mode ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const MapViewModeSelectItem = ({ viewMode }: { viewMode: MapViewMode }) => {
  return (
    <div className="flex items-center gap-2">
      {(() => {
        if (viewMode === "split") {
          return (
            <>
              <SquareSplitHorizontal />
              <span>スプリット</span>
            </>
          );
        }
        if (viewMode === "overlap") {
          return (
            <>
              <Layers2 />
              <span>オーバーラップ</span>
            </>
          );
        }

        return (
          <>
            <MapIcon />
            <span>シングル</span>
          </>
        );
      })()}
    </div>
  );
};
