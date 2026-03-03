"use client";

import { useStore } from "@/hooks/store/useStore";
import { Window } from "../ui/window";
import { MeasureModeSelector } from "./measure-mode-selector";
import { MeasureResultDisplay } from "./measure-result-display";
import { MeasureHistoryList } from "./measure-history-list";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Trash2 } from "lucide-react";
import { exportMeasureResults } from "@/lib/measure/exportMeasure";
import { clearMeasureData } from "@/lib/measure/measurePersistence";
import Link from "next/link";

export const MeasureWindow = () => {
  const isMeasureWindowOpen = useStore((state) => state.isMeasureWindowOpen);
  const setIsMeasureWindowOpen = useStore(
    (state) => state.setIsMeasureWindowOpen,
  );
  const measureResults = useStore((state) => state.measureResults);
  const clearMeasureResults = useStore((state) => state.clearMeasureResults);
  const td = useStore((state) => state.maps.main.td);
  const subTd = useStore((state) => state.maps.sub.td);

  const handleClearAll = () => {
    // Remove all measure features from TerraDraw
    for (const result of measureResults) {
      const targetTd = result.mapId === "main" ? td : subTd;
      if (targetTd) {
        try {
          targetTd.removeFeatures([result.featureId]);
        } catch {
          // Feature may already be removed
        }
      }
    }
    clearMeasureResults();
    clearMeasureData();
  };

  const handleExport = () => {
    const features: Record<string, GeoJSON.Feature> = {};
    for (const result of measureResults) {
      const targetTd = result.mapId === "main" ? td : subTd;
      if (targetTd) {
        try {
          const feature = targetTd.getSnapshotFeature(result.featureId);
          if (feature) {
            features[String(result.featureId)] = feature as GeoJSON.Feature;
          }
        } catch {
          // Feature may no longer exist
        }
      }
    }
    exportMeasureResults(measureResults, features);
  };

  return (
    <Window
      title="計測"
      className="w-70"
      isOpen={isMeasureWindowOpen}
      onClose={() => {
        setIsMeasureWindowOpen(false);
      }}
    >
      <div className="grid gap-2">
        <div className="flex justify-start">
          <MeasureModeSelector />
        </div>
        <Separator />
        <MeasureResultDisplay />
        {measureResults.length > 0 && (
          <>
            <Separator />
            <MeasureHistoryList />
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="xs"
                className="text-xs"
                onClick={handleExport}
              >
                <Download className="size-3" />
                エクスポート
              </Button>
              <Button
                variant="outline"
                size="xs"
                className="text-xs"
                onClick={handleClearAll}
              >
                <Trash2 className="size-3" />
                全削除
              </Button>
            </div>
          </>
        )}
        <Link
          href="https://maps.gsi.go.jp/help/howtouse.html"
          target="_blank"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="size-3" />
          計測値の説明
        </Link>
      </div>
    </Window>
  );
};
