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
    <>
      <Select value={baseLayer.id} onValueChange={handleOnValueChange}>
        <SelectTrigger className="w-full" size="lg">
          <SelectValue>
            <BaseLayerSelectItem baseLayer={baseLayer} displayType />
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="start">
          <SelectGroup>
            <SelectLabel>ベクトル形式</SelectLabel>
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
            <SelectLabel>画像形式</SelectLabel>
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
            {baseLayers
              .filter((l) => l.type === "none")
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
          <div className="px-1 py-1">
            <div className="text-xs text-muted-foreground py-1">
              カスタム ({customLayers.length}/{MAX_CUSTOM_LAYERS})
            </div>
          </div>
          {customLayers.map((layer) => (
            <div
              key={layer.id}
              className="flex items-center hover:bg-accent rounded-sm pr-1"
            >
              <SelectItem
                value={layer.id}
                className="cursor-pointer flex-1 pr-0"
              >
                <BaseLayerSelectItem
                  baseLayer={storageItemToBaseLayer(layer)}
                />
              </SelectItem>
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 size-6"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleDeleteLayer(layer.id);
                }}
              >
                <Trash2Icon className="size-3" />
              </Button>
            </div>
          ))}
          <button
            className="h-10 w-full flex items-center gap-2 px-2 rounded-sm hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
            disabled={!canAddMore}
            onPointerDown={(e) => {
              e.preventDefault();
              if (canAddMore) {
                setDialogOpen(true);
              }
            }}
          >
            <div className="size-8 bg-muted rounded-sm flex items-center justify-center">
              <PlusIcon className="size-4 text-muted-foreground" />
            </div>
            <span className="text-sm">カスタムスタイルの追加</span>
          </button>
        </SelectContent>
      </Select>

      <CustomLayerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentCount={customLayers.length}
        onLayerAdded={handleLayerAdded}
      />
    </>
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
        return "画像形式";
      case "vector":
        return "ベクトル形式";
      case "custom":
        return "カスタム";
      case "none":
        return "";
    }
  };

  return (
    <div className="h-8 flex gap-2 items-center">
      <div className="rounded-sm overflow-hidden size-8 relative">
        {baseLayer.type === "none" ? (
          <div className="size-8 bg-white border border-muted" />
        ) : baseLayer.type === "custom" ? (
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
