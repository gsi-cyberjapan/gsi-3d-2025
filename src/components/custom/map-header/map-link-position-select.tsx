"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useGlobalStore } from "@/hooks/store/useGlobalStore";
import { useMap } from "@vis.gl/react-maplibre";
import { useRef, useEffect, useCallback } from "react";
import { MAP_CONFIG } from "@/lib/config";
import type { MapLibreEvent } from "maplibre-gl";

export const MapLinkPositionSelect = () => {
  const [mapPrimary, mapSecondary] = [
    useMap()[MAP_CONFIG.MAP_PRIMARY.ID]?.getMap(),
    useMap()[MAP_CONFIG.MAP_SECONDARY.ID]?.getMap(),
  ];
  const isLinkMapPosition = useGlobalStore((state) => state.isLinkMapPosition);
  const setIsLinkMapPosition = useGlobalStore(
    (state) => state.setIsLinkMapPosition,
  );
  const rafRef = useRef<number | undefined>(undefined);

  const handlePrimaryMapMove = useCallback(
    (ev?: MapLibreEvent<MouseEvent | TouchEvent | WheelEvent | undefined>) => {
      if (!mapPrimary || !mapSecondary) return;
      if (ev && (!("originalEvent" in ev) || !ev.originalEvent)) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = undefined;
        const mapPrimaryCenter = mapPrimary.getCenter();
        const mapPrimaryZoom = mapPrimary.getZoom();
        mapSecondary.jumpTo({
          center: [mapPrimaryCenter.lng, mapPrimaryCenter.lat],
          zoom: mapPrimaryZoom,
        });
      });
    },
    [mapPrimary, mapSecondary],
  );

  const handleSecondaryMapMove = useCallback(
    (ev: MapLibreEvent<MouseEvent | TouchEvent | WheelEvent | undefined>) => {
      if (!mapPrimary || !mapSecondary) return;
      if (!("originalEvent" in ev) || !ev.originalEvent) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = undefined;
        const mapSecondaryCenter = mapSecondary.getCenter();
        const mapSecondaryZoom = mapSecondary.getZoom();
        mapPrimary.jumpTo({
          center: [mapSecondaryCenter.lng, mapSecondaryCenter.lat],
          zoom: mapSecondaryZoom,
        });
      });
    },
    [mapPrimary, mapSecondary],
  );

  useEffect(() => {
    if (!mapPrimary || !mapSecondary || !isLinkMapPosition) return;
    handlePrimaryMapMove();
    mapPrimary.on("move", handlePrimaryMapMove);
    mapSecondary.on("move", handleSecondaryMapMove);
    return () => {
      mapPrimary.off("move", handlePrimaryMapMove);
      mapSecondary.off("move", handleSecondaryMapMove);
      if (rafRef.current !== undefined) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [
    mapPrimary,
    mapSecondary,
    handlePrimaryMapMove,
    handleSecondaryMapMove,
    isLinkMapPosition,
  ]);

  return (
    <Label className="cursor-pointer hover:bg-accent/50 dark:bg-input/30 dark:hover:bg-input/50 dark:border-input shadow-xs flex gap-3 rounded-md border px-3 h-8 items-center has-aria-checked:border-blue-600 has-aria-checked:bg-blue-50 dark:has-aria-checked:border-blue-900 dark:has-aria-checked:bg-blue-950">
      <Checkbox
        checked={isLinkMapPosition}
        onCheckedChange={setIsLinkMapPosition}
        className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
      />
      <div className="grid gap-1.5 font-normal">
        <p className="text-sm leading-none font-medium">地図の位置を連動</p>
      </div>
    </Label>
  );
};
