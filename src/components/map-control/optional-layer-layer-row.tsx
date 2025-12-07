"use client";

import { Layers } from "lucide-react";
import { useStore } from "@/hooks/store/useStore";
import { cn } from "@/lib/utils";

interface OptionalLayerLayerRowProps {
  layerId: string;
  title: string;
}

export const OptionalLayerLayerRow = ({
  layerId,
  title,
}: OptionalLayerLayerRowProps) => {
  const focusMapId = useStore((state) => state.focusMapId);
  const optionalLayers = useStore(
    (state) => state.maps[focusMapId].optionalLayers,
  );
  const setOptionalLayer = useStore((state) => state.setOptionalLayer);
  const isSelected = optionalLayers.some((l) => l.layerId === layerId);

  const handleClick = () => {
    if (isSelected) {
      setOptionalLayer({
        mapId: focusMapId,
        layers: optionalLayers.filter((l) => l.layerId !== layerId),
      });
    } else {
      setOptionalLayer({
        mapId: focusMapId,
        layers: [...optionalLayers, { layerId, title, opacity: 0.5 }],
      });
    }
  };

  return (
    <div
      className={cn(
        "flex gap-1 text-xs items-start cursor-pointer hover:opacity-80",
        isSelected && "text-blue-500",
      )}
      onClick={handleClick}
    >
      <Layers className="text-muted-foreground size-3 shrink-0 mt-0.5" />
      <span>{title}</span>
    </div>
  );
};
