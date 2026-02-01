"use client";

import { useMemo } from "react";
import { useMap } from "react-map-gl/maplibre";
import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Props {
  mapId: MapId;
}

export const ZoomGuide = ({ mapId }: Props) => {
  const layoutMode = useStore((state) => state.layoutMode);
  const isZoomGuideDismissed = useStore((state) => state.isZoomGuideDismissed);
  const setZoomGuideDismissed = useStore(
    (state) => state.setZoomGuideDismissed,
  );
  const mainOptionalLayers = useStore(
    (state) => state.maps.main.optionalLayers,
  );
  const subOptionalLayers = useStore((state) => state.maps.sub.optionalLayers);
  const { [mapId]: mapRef } = useMap();

  // Get the current zoom level from the map
  const currentZoom = mapRef?.getMap().getZoom() ?? 0;

  // Determine if this component should be shown based on layout mode
  const shouldShowOnThisMap = useMemo(() => {
    if (layoutMode === "single") {
      return mapId === "main";
    } else if (layoutMode === "split") {
      return true;
    } else {
      // overlay: Show only on sub map
      return mapId === "sub";
    }
  }, [layoutMode, mapId]);

  // Get the optional layers to consider based on layout mode and mapId
  const relevantLayers = useMemo(() => {
    if (layoutMode === "overlay") {
      // In overlay mode, consider both maps' layers
      return [...mainOptionalLayers, ...subOptionalLayers];
    } else if (layoutMode === "single") {
      return mainOptionalLayers;
    } else {
      // split mode: each map shows its own layers
      return mapId === "main" ? mainOptionalLayers : subOptionalLayers;
    }
  }, [layoutMode, mapId, mainOptionalLayers, subOptionalLayers]);

  // Calculate the strictest zoom range from all layers
  const zoomRange = useMemo(() => {
    const layersWithZoom = relevantLayers.filter(
      (layer) => layer.minZoom !== undefined || layer.maxZoom !== undefined,
    );

    if (layersWithZoom.length === 0) {
      return null;
    }

    // Get the strictest (most restrictive) values
    // minZoom: take the maximum of all minZooms (stricter lower bound)
    // maxZoom: take the minimum of all maxZooms (stricter upper bound)
    const minZooms = layersWithZoom
      .map((layer) => layer.minZoom)
      .filter((z): z is number => z !== undefined);
    const maxZooms = layersWithZoom
      .map((layer) => layer.maxZoom)
      .filter((z): z is number => z !== undefined);

    const minZoom = minZooms.length > 0 ? Math.max(...minZooms) : undefined;
    const maxZoom = maxZooms.length > 0 ? Math.min(...maxZooms) : undefined;

    if (minZoom === undefined && maxZoom === undefined) {
      return null;
    }

    return { minZoom, maxZoom };
  }, [relevantLayers]);

  // Check if current zoom is out of range
  const isOutOfRange = useMemo(() => {
    if (!zoomRange) return false;
    const { minZoom, maxZoom } = zoomRange;
    if (minZoom !== undefined && currentZoom < minZoom) return true;
    if (maxZoom !== undefined && currentZoom > maxZoom) return true;
    return false;
  }, [zoomRange, currentZoom]);

  // Don't render if conditions aren't met
  if (!shouldShowOnThisMap) return null;
  if (isZoomGuideDismissed) return null;
  if (!zoomRange) return null;
  if (!isOutOfRange) return null;

  // Format the zoom range message
  const formatZoomRange = () => {
    const { minZoom, maxZoom } = zoomRange;
    if (minZoom !== undefined && maxZoom !== undefined) {
      return `ズーム${String(minZoom)}〜${String(maxZoom)}`;
    } else if (minZoom !== undefined) {
      return `ズーム${String(minZoom)}以上`;
    } else if (maxZoom !== undefined) {
      return `ズーム${String(maxZoom)}以下`;
    }
    return "";
  };

  return (
    <div className="p-2 rounded-md text-xs bg-background/85 backdrop-blur-sm border border-border shadow-sm max-w-[320px]">
      <p className="mb-2 whitespace-pre-line">
        この情報は{formatZoomRange()}
        で表示されます。
        {"\n"}
        なお、整備範囲が全国であるとは限りません。
      </p>
      <div className="flex items-center gap-2">
        <Checkbox
          id={`zoom-guide-dismiss-${mapId}`}
          checked={isZoomGuideDismissed}
          onCheckedChange={(checked) => {
            setZoomGuideDismissed(checked === true);
          }}
        />
        <Label
          htmlFor={`zoom-guide-dismiss-${mapId}`}
          className="text-xs cursor-pointer"
        >
          以後表示しない
        </Label>
      </div>
    </div>
  );
};
