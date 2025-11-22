"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/hooks/store/useStore";
import { BaseLayer, getBaseLayers } from "@/lib/getBaseLayers";
import Image from "next/image";

export const BaseLayerSelector = () => {
  const focusMapId = useStore((state) => state.focusMapId);
  const baseLayer = useStore((state) => state.maps[focusMapId].baseLayer);
  const setBaseLayer = useStore((state) => state.setBaseLayer);
  const baseLayers = getBaseLayers();

  const handleOnValueChange = (layerId: string) => {
    const targetBaseLayer = baseLayers.find((l) => l.id === layerId);

    if (!targetBaseLayer || layerId === baseLayer.id) return;
    setBaseLayer({ mapId: focusMapId, baseLayer: targetBaseLayer });
  };

  return (
    <Select value={baseLayer.id} onValueChange={handleOnValueChange}>
      <SelectTrigger className="w-full" size="lg">
        <SelectValue>
          <BaseLayerSelectItem baseLayer={baseLayer} displayType />
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        <SelectGroup>
          <SelectLabel>Vector</SelectLabel>
          {baseLayers
            .filter((l) => l.type === "vector")
            .map((layer) => (
              <SelectItem
                key={layer.id}
                value={layer.id}
                className="cursor-pointer"
              >
                <BaseLayerSelectItem baseLayer={layer} />
              </SelectItem>
            ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Ruster</SelectLabel>
          {baseLayers
            .filter((l) => l.type === "raster")
            .map((layer) => (
              <SelectItem
                key={layer.id}
                value={layer.id}
                className="cursor-pointer"
              >
                <BaseLayerSelectItem baseLayer={layer} />
              </SelectItem>
            ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Globe</SelectLabel>
          {baseLayers
            .filter((l) => l.type === "globe")
            .map((layer) => (
              <SelectItem
                key={layer.id}
                value={layer.id}
                className="cursor-pointer"
              >
                <BaseLayerSelectItem baseLayer={layer} />
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

interface BaseLayerSelectItemProps {
  baseLayer: BaseLayer;
  displayType?: boolean;
}
const BaseLayerSelectItem = ({
  baseLayer,
  displayType = false,
}: BaseLayerSelectItemProps) => {
  return (
    <div className="h-8 flex gap-2 items-center">
      <div className="rounded-sm overflow-hidden size-8 relative">
        <Image
          src={baseLayer.legendImageUrl}
          fill
          alt={`${baseLayer.label}のアイコン`}
        />
      </div>
      <div className="flex items-cemter gap-2">
        {baseLayer.label}
        {displayType && (
          <span className="text-muted-foreground">
            {(() => {
              if (baseLayer.type === "globe") {
                return "Globe";
              } else if (baseLayer.type === "raster") {
                return "Raster";
              } else {
                return "Vector";
              }
            })()}
          </span>
        )}
      </div>
    </div>
  );
};
