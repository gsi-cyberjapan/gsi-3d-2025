"use client";

import { useState, useSyncExternalStore } from "react";
import { PlusIcon, Trash2Icon, LayersIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/store/useStore";
import { BaseLayer, CustomBaseLayer, getBaseLayers } from "@/lib/getBaseLayers";
import {
  getCustomLayers,
  deleteCustomLayer,
  MAX_CUSTOM_LAYERS,
  type CustomLayerStorageItem,
} from "@/lib/customBaseLayers";
import { CustomLayerDialog } from "./custom-layer-dialog";
import Image from "next/image";

const DEFAULT_LEGEND_IMAGE = "/images/icons/custom-layer.svg";

const storageItemToBaseLayer = (
  item: CustomLayerStorageItem,
): CustomBaseLayer => ({
  id: item.id,
  type: "custom",
  label: item.label,
  legendImageUrl: DEFAULT_LEGEND_IMAGE,
  sourceType: item.sourceType,
  source: item.source,
  data: item.data,
  minZoom: item.minZoom,
  maxZoom: item.maxZoom,
});

// Custom hook to sync custom layers with localStorage
const useCustomLayers = () => {
  // Track version to trigger re-renders when layers change
  const [version, setVersion] = useState(0);

  const subscribe = (callback: () => void) => {
    // Listen for storage events from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "gsi-3d-2025-custom-base-layers") {
        callback();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  };

  const getSnapshot = () => {
    return JSON.stringify(getCustomLayers()) + version.toString();
  };

  const getServerSnapshot = () => "[]0";

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const layers = getCustomLayers();

  const addLayer = (layer: CustomLayerStorageItem) => {
    setVersion((v) => v + 1);
    return layer;
  };

  const removeLayer = (id: string) => {
    deleteCustomLayer(id);
    setVersion((v) => v + 1);
  };

  return { layers, addLayer, removeLayer };
};

export const BaseLayerSelector = () => {
  const focusMapId = useStore((state) => state.focusMapId);
  const baseLayer = useStore((state) => state.maps[focusMapId].baseLayer);
  const setBaseLayer = useStore((state) => state.setBaseLayer);
  const baseLayers = getBaseLayers();

  const { layers: customLayers, addLayer, removeLayer } = useCustomLayers();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Build all layers including custom ones
  const allLayers: BaseLayer[] = [
    ...baseLayers,
    ...customLayers.map(storageItemToBaseLayer),
  ];

  const handleOnValueChange = (layerId: string) => {
    const targetBaseLayer = allLayers.find((l) => l.id === layerId);
    if (!targetBaseLayer || layerId === baseLayer.id) return;
    setBaseLayer({ mapId: focusMapId, baseLayer: targetBaseLayer });
  };

  const handleLayerAdded = (layer: CustomLayerStorageItem) => {
    addLayer(layer);
  };

  const handleDeleteLayer = (id: string) => {
    removeLayer(id);
    // If the deleted layer was selected, switch to the first base layer
    if (baseLayer.id === id) {
      setBaseLayer({ mapId: focusMapId, baseLayer: baseLayers[0] });
    }
  };

  const canAddMore = customLayers.length < MAX_CUSTOM_LAYERS;

  return (
    <div className="flex flex-col gap-3">
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
            <SelectLabel>Raster</SelectLabel>
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
          {customLayers.length > 0 && (
            <SelectGroup>
              <SelectLabel>Custom</SelectLabel>
              {customLayers.map((layer) => (
                <SelectItem
                  key={layer.id}
                  value={layer.id}
                  className="cursor-pointer"
                >
                  <BaseLayerSelectItem
                    baseLayer={storageItemToBaseLayer(layer)}
                  />
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>

      <div className="border rounded-md p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Custom ({customLayers.length}/{String(MAX_CUSTOM_LAYERS)})
          </span>
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              setDialogOpen(true);
            }}
            disabled={!canAddMore}
          >
            <PlusIcon className="size-3" />
            Add
          </Button>
        </div>

        {customLayers.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            TileJSON / MapLibre Style Specification
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {customLayers.map((layer) => (
              <li
                key={layer.id}
                className="flex items-center justify-between gap-2 py-1"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <LayersIcon className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate">{layer.label}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {layer.sourceType === "style" ? "Style" : "TileJSON"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 size-6"
                  onClick={() => {
                    handleDeleteLayer(layer.id);
                  }}
                >
                  <Trash2Icon className="size-3" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CustomLayerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentCount={customLayers.length}
        onLayerAdded={handleLayerAdded}
      />
    </div>
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
  const getTypeLabel = (type: BaseLayer["type"]) => {
    switch (type) {
      case "raster":
        return "Raster";
      case "vector":
        return "Vector";
      case "custom":
        return "Custom";
    }
  };

  return (
    <div className="h-8 flex gap-2 items-center">
      <div className="rounded-sm overflow-hidden size-8 relative">
        {baseLayer.type === "custom" ? (
          <div className="size-8 bg-muted flex items-center justify-center">
            <LayersIcon className="size-4 text-muted-foreground" />
          </div>
        ) : (
          <Image
            src={baseLayer.legendImageUrl}
            fill
            alt={`${baseLayer.label}のアイコン`}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        {baseLayer.label}
        {displayType && (
          <span className="text-muted-foreground">
            {getTypeLabel(baseLayer.type)}
          </span>
        )}
      </div>
    </div>
  );
};
