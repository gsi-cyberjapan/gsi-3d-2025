"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { useEffect, useRef, useCallback } from "react";
import { calculateDistance } from "@/lib/measure/calculateDistance";
import { calculateArea } from "@/lib/measure/calculateArea";
import {
  saveMeasureData,
  loadMeasureData,
} from "@/lib/measure/measurePersistence";
import type { GeoJSONStoreFeatures } from "terra-draw";

export const MeasureController = ({ mapId }: { mapId: MapId }) => {
  const isMeasureWindowOpen = useStore((state) => state.isMeasureWindowOpen);
  const measureMode = useStore((state) => state.measureMode);
  const setCurrentMeasurement = useStore(
    (state) => state.setCurrentMeasurement,
  );
  const td = useStore((state) => state.maps[mapId].td);
  const addMeasureResult = useStore((state) => state.addMeasureResult);
  const measureResults = useStore((state) => state.measureResults);
  const removeMeasureResult = useStore((state) => state.removeMeasureResult);
  const hydrateMeasureState = useStore((state) => state.hydrateMeasureState);
  const currentDrawingIdRef = useRef<string | number | null>(null);
  const isRestoredRef = useRef(false);

  // Restore measure features from localStorage on TerraDraw init
  useEffect(() => {
    if (!td || isRestoredRef.current) return;
    isRestoredRef.current = true;

    const stored = loadMeasureData();
    if (!stored) return;

    const restoredResults = stored.results.filter((r) => r.mapId === mapId);
    if (restoredResults.length === 0) return;

    try {
      const featuresToAdd: GeoJSONStoreFeatures[] = restoredResults
        .map((result) => stored.features[String(result.featureId)])
        .filter((f): f is GeoJSONStoreFeatures => f !== undefined);
      if (featuresToAdd.length > 0) {
        td.addFeatures(featuresToAdd);
      }
    } catch {
      // Features may fail to add if already present or invalid
    }

    hydrateMeasureState({ measureResults: stored.results });
  }, [td, mapId, hydrateMeasureState]);

  // Save to localStorage whenever measureResults change
  useEffect(() => {
    if (!td) return;

    const features: Record<string, GeoJSON.Feature> = {};
    for (const result of measureResults) {
      if (result.mapId !== mapId) continue;
      try {
        const feature = td.getSnapshotFeature(result.featureId);
        if (feature) {
          features[String(result.featureId)] = feature as GeoJSON.Feature;
        }
      } catch {
        // Feature may no longer exist
      }
    }

    saveMeasureData(measureResults, features);
  }, [td, measureResults, mapId]);

  const handleChange = useCallback(
    (ids: (string | number)[], type: string) => {
      if (!td || !isMeasureWindowOpen) return;

      const currentModeName =
        measureMode === "distance" ? "measure-linestring" : "measure-polygon";

      // Remove previous measure features when a new one is created
      if (type === "create") {
        const newMeasureFeature = ids.some((id) => {
          const f = td.getSnapshotFeature(id);
          return (
            f?.properties.mode === currentModeName &&
            f.properties.source !== "measure"
          );
        });

        if (newMeasureFeature) {
          const existingResults = measureResults.filter(
            (r) => r.mapId === mapId,
          );
          for (const result of existingResults) {
            try {
              td.removeFeatures([result.featureId]);
            } catch {
              /* Feature may already be removed */
            }
            removeMeasureResult(result.id);
          }
        }
      }

      // Handle feature creation and update
      if (type === "create" || type === "update") {
        for (const id of ids) {
          const feature = td.getSnapshotFeature(id) as
            | GeoJSONStoreFeatures
            | undefined;
          if (!feature || feature.properties.mode !== currentModeName) continue;

          // Only track currently drawing features for real-time display
          if (feature.properties.currentlyDrawing) {
            currentDrawingIdRef.current = id;
          }

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

      // Handle feature deletion - clear measurement when currently drawing feature is deleted
      if (type === "delete") {
        if (
          currentDrawingIdRef.current !== null &&
          ids.includes(currentDrawingIdRef.current)
        ) {
          currentDrawingIdRef.current = null;
          setCurrentMeasurement(null);
        }
      }
    },
    [
      td,
      isMeasureWindowOpen,
      measureMode,
      setCurrentMeasurement,
      measureResults,
      removeMeasureResult,
      mapId,
    ],
  );

  const handleFinish = useCallback(
    (id: string | number) => {
      if (!td) return;

      const feature = td.getSnapshotFeature(id) as
        | GeoJSONStoreFeatures
        | undefined;
      if (!feature) return;

      const featureMode = feature.properties.mode;
      if (
        featureMode !== "measure-linestring" &&
        featureMode !== "measure-polygon"
      ) {
        return;
      }

      const type: "distance" | "area" =
        featureMode === "measure-linestring" ? "distance" : "area";

      let value = 0;
      if (feature.geometry.type === "LineString" && type === "distance") {
        const coords = feature.geometry.coordinates as number[][];
        value = calculateDistance(coords);
      } else if (feature.geometry.type === "Polygon" && type === "area") {
        const coords = feature.geometry.coordinates[0] as number[][];
        value = calculateArea(coords);
      }

      addMeasureResult({
        id: crypto.randomUUID(),
        featureId: id,
        mapId,
        type,
        value,
      });

      // Mark feature as a completed measurement so recovery won't treat it as new
      td.updateFeatureProperties(id, { source: "measure" });

      // Reset current measurement display for next drawing
      currentDrawingIdRef.current = null;
      setCurrentMeasurement(null);
    },
    [td, mapId, addMeasureResult, setCurrentMeasurement],
  );

  // Subscribe to TerraDraw change events
  useEffect(() => {
    if (!td || !isMeasureWindowOpen) return;

    td.on("change", handleChange);

    return () => {
      td.off("change", handleChange);
    };
  }, [td, isMeasureWindowOpen, handleChange]);

  // Subscribe to TerraDraw finish events
  useEffect(() => {
    if (!td) return;

    td.on("finish", handleFinish);

    return () => {
      td.off("finish", handleFinish);
    };
  }, [td, handleFinish]);

  // Clear current measurement when closing the window or switching modes
  useEffect(() => {
    if (!isMeasureWindowOpen) {
      currentDrawingIdRef.current = null;
      setCurrentMeasurement(null);
    }
  }, [isMeasureWindowOpen, setCurrentMeasurement]);

  useEffect(() => {
    currentDrawingIdRef.current = null;
    setCurrentMeasurement(null);
  }, [measureMode, setCurrentMeasurement]);

  return null;
};
