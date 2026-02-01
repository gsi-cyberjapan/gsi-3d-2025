"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { useEffect, useRef, useCallback } from "react";
import { calculateDistance } from "@/lib/measure/calculateDistance";
import { calculateArea } from "@/lib/measure/calculateArea";
import type { GeoJSONStoreFeatures } from "terra-draw";

export const MeasureController = ({ mapId }: { mapId: MapId }) => {
  const isMeasureWindowOpen = useStore((state) => state.isMeasureWindowOpen);
  const measureMode = useStore((state) => state.measureMode);
  const setCurrentMeasurement = useStore(
    (state) => state.setCurrentMeasurement,
  );
  const td = useStore((state) => state.maps[mapId].td);
  const measureFeatureIdRef = useRef<string | number | null>(null);

  const handleChange = useCallback(
    (ids: (string | number)[], type: string) => {
      if (!td || !isMeasureWindowOpen) return;

      const currentModeName =
        measureMode === "distance" ? "measure-linestring" : "measure-polygon";

      // Handle feature creation and update
      if (type === "create" || type === "update") {
        for (const id of ids) {
          const feature = td.getSnapshotFeature(id) as
            | GeoJSONStoreFeatures
            | undefined;
          if (!feature || feature.properties.mode !== currentModeName) continue;

          measureFeatureIdRef.current = id;

          if (
            feature.geometry.type === "LineString" &&
            measureMode === "distance"
          ) {
            const coords = feature.geometry.coordinates as number[][];
            const distance = calculateDistance(coords);
            setCurrentMeasurement(distance);
          } else if (
            feature.geometry.type === "Polygon" &&
            measureMode === "area"
          ) {
            const coords = feature.geometry.coordinates[0] as number[][];
            const area = calculateArea(coords);
            setCurrentMeasurement(area);
          }
        }
      }

      // Handle feature deletion - clear measurement when feature is deleted
      if (type === "delete") {
        if (
          measureFeatureIdRef.current !== null &&
          ids.includes(measureFeatureIdRef.current)
        ) {
          measureFeatureIdRef.current = null;
          setCurrentMeasurement(null);
        }
      }
    },
    [td, isMeasureWindowOpen, measureMode, setCurrentMeasurement],
  );

  // Subscribe to TerraDraw change events
  useEffect(() => {
    if (!td || !isMeasureWindowOpen) return;

    td.on("change", handleChange);

    return () => {
      td.off("change", handleChange);
    };
  }, [td, isMeasureWindowOpen, handleChange]);

  // Clean up measure features when closing the window or switching modes
  useEffect(() => {
    if (!td) return;

    // When measure window is closed, delete any measure features
    if (!isMeasureWindowOpen && measureFeatureIdRef.current !== null) {
      try {
        td.removeFeatures([measureFeatureIdRef.current]);
      } catch {
        // Feature might already be deleted
      }
      measureFeatureIdRef.current = null;
    }
  }, [td, isMeasureWindowOpen]);

  // Clean up when measure mode changes
  useEffect(() => {
    if (!td || !isMeasureWindowOpen) return;

    // Delete previous measure feature when switching modes
    if (measureFeatureIdRef.current !== null) {
      try {
        td.removeFeatures([measureFeatureIdRef.current]);
      } catch {
        // Feature might already be deleted
      }
      measureFeatureIdRef.current = null;
      setCurrentMeasurement(null);
    }
  }, [td, measureMode, isMeasureWindowOpen, setCurrentMeasurement]);

  return null;
};
