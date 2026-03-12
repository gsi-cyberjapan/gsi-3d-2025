"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Window } from "@/components/ui/window";
import { useStore } from "@/hooks/store/useStore";
import { MapId } from "@/hooks/store/mapManagerState";
import { useMap } from "react-map-gl/maplibre";
import {
  captureMapCanvas,
  cropCanvasToBBox,
  drawScaleBar,
  drawCredit,
  canvasToBlob,
  downloadBlob,
} from "@/lib/saveImage";
import { SaveImageBBoxInputs } from "./save-image-bbox-inputs";

type RangeMode = "viewport" | "bbox";

export const SaveImageWindow = () => {
  const isSaveImageWindowOpen = useStore(
    (state) => state.isSaveImageWindowOpen,
  );
  const setIsSaveImageWindowOpen = useStore(
    (state) => state.setIsSaveImageWindowOpen,
  );
  const layoutMode = useStore((state) => state.layoutMode);
  const isSplitMode = layoutMode === "split" || layoutMode === "overlay";

  const saveImageBBox = useStore((state) => state.saveImageBBox);
  const setSaveImageBBox = useStore((state) => state.setSaveImageBBox);
  const isSaveImageBBoxMode = useStore((state) => state.isSaveImageBBoxMode);
  const setIsSaveImageBBoxMode = useStore(
    (state) => state.setIsSaveImageBBoxMode,
  );
  const saveImageTargetMapId = useStore((state) => state.saveImageTargetMapId);
  const setSaveImageTargetMapId = useStore(
    (state) => state.setSaveImageTargetMapId,
  );

  const maps = useMap();

  const [rangeMode, setRangeMode] = useState<RangeMode>("viewport");
  const [filename, setFilename] = useState("map-image");
  const [includeScaleBar, setIncludeScaleBar] = useState(true);
  const [includeCredit, setIncludeCredit] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCanvas, setGeneratedCanvas] =
    useState<HTMLCanvasElement | null>(null);

  const getMap = useCallback(() => {
    return maps[saveImageTargetMapId]?.getMap() ?? null;
  }, [maps, saveImageTargetMapId]);

  const initBBoxFromMap = useCallback(() => {
    const map = getMap();
    if (!map) return;
    const bounds = map.getBounds();
    const center = bounds.getCenter();
    // Use 80% of viewport as initial bbox
    const northSouthSpan = bounds.getNorth() - bounds.getSouth();
    const eastWestSpan = bounds.getEast() - bounds.getWest();
    const margin = 0.1; // 10% margin on each side → 80% total
    setSaveImageBBox({
      north:
        Math.round((center.lat + northSouthSpan * (0.5 - margin)) * 10000) /
        10000,
      south:
        Math.round((center.lat - northSouthSpan * (0.5 - margin)) * 10000) /
        10000,
      east:
        Math.round((center.lng + eastWestSpan * (0.5 - margin)) * 10000) /
        10000,
      west:
        Math.round((center.lng - eastWestSpan * (0.5 - margin)) * 10000) /
        10000,
    });
  }, [getMap, setSaveImageBBox]);

  const handleRangeModeChange = useCallback(
    (value: string) => {
      const mode = value as RangeMode;
      setRangeMode(mode);
      if (mode === "bbox") {
        setIsSaveImageBBoxMode(true);
        initBBoxFromMap();
      } else {
        setIsSaveImageBBoxMode(false);
        setSaveImageBBox(null);
      }
      setPreviewUrl(null);
      setGeneratedCanvas(null);
    },
    [initBBoxFromMap, setIsSaveImageBBoxMode, setSaveImageBBox],
  );

  const handleMapIdChange = useCallback(
    (value: string) => {
      const mapId = value as MapId;
      setSaveImageTargetMapId(mapId);
      setPreviewUrl(null);
      setGeneratedCanvas(null);
      if (rangeMode === "bbox") {
        // Re-init bbox for the new map
        const map = maps[mapId]?.getMap() ?? null;
        if (map) {
          const bounds = map.getBounds();
          const center = bounds.getCenter();
          const northSouthSpan = bounds.getNorth() - bounds.getSouth();
          const eastWestSpan = bounds.getEast() - bounds.getWest();
          const margin = 0.1;
          setSaveImageBBox({
            north:
              Math.round(
                (center.lat + northSouthSpan * (0.5 - margin)) * 10000,
              ) / 10000,
            south:
              Math.round(
                (center.lat - northSouthSpan * (0.5 - margin)) * 10000,
              ) / 10000,
            east:
              Math.round((center.lng + eastWestSpan * (0.5 - margin)) * 10000) /
              10000,
            west:
              Math.round((center.lng - eastWestSpan * (0.5 - margin)) * 10000) /
              10000,
          });
        }
      }
    },
    [maps, rangeMode, setSaveImageTargetMapId, setSaveImageBBox],
  );

  const handleGenerate = useCallback(async () => {
    const map = getMap();
    if (!map) return;

    setIsGenerating(true);
    try {
      // Small delay to allow UI update
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Hide bbox layers before capture
      const bboxLayerIds = [
        `${saveImageTargetMapId}-save-image-bbox-fill`,
        `${saveImageTargetMapId}-save-image-bbox-line`,
        `${saveImageTargetMapId}-save-image-bbox-handles`,
      ];
      const layerVisibilities: Record<string, string> = {};
      for (const layerId of bboxLayerIds) {
        const layer = map.getLayer(layerId);
        if (layer) {
          const currentVisibility = map.getLayoutProperty(
            layerId,
            "visibility",
          ) as string | undefined;
          layerVisibilities[layerId] = currentVisibility ?? "visible";
          map.setLayoutProperty(layerId, "visibility", "none");
        }
      }

      // Wait for a render frame so layer visibility takes effect
      map.triggerRepaint();
      await map.once("render");

      let canvas = captureMapCanvas(map);

      if (rangeMode === "bbox" && saveImageBBox) {
        canvas = cropCanvasToBBox(canvas, map, saveImageBBox);
      }

      if (includeScaleBar) {
        drawScaleBar(canvas, map);
      }

      if (includeCredit) {
        drawCredit(canvas);
      }

      // Restore bbox layer visibility
      for (const [layerId, visibility] of Object.entries(layerVisibilities)) {
        map.setLayoutProperty(layerId, "visibility", visibility);
      }

      // Clean up previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const blob = await canvasToBlob(canvas);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setGeneratedCanvas(canvas);
    } finally {
      setIsGenerating(false);
    }
  }, [
    getMap,
    rangeMode,
    saveImageBBox,
    saveImageTargetMapId,
    includeScaleBar,
    includeCredit,
    previewUrl,
  ]);

  const handleSavePng = useCallback(async () => {
    if (!generatedCanvas) return;
    const blob = await canvasToBlob(generatedCanvas);
    downloadBlob(blob, `${filename}.png`);
  }, [generatedCanvas, filename]);

  const handleClose = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setGeneratedCanvas(null);
    setRangeMode("viewport");
    setIsSaveImageWindowOpen(false);
  }, [setIsSaveImageWindowOpen, previewUrl]);

  const isBBoxValid =
    rangeMode !== "bbox" ||
    (saveImageBBox !== null &&
      saveImageBBox.north > saveImageBBox.south &&
      saveImageBBox.east > saveImageBBox.west);

  return (
    <Window
      title="画像として保存"
      className="w-80"
      isOpen={isSaveImageWindowOpen}
      onClose={handleClose}
    >
      <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto scrollbar-transparent-thin">
        {isSplitMode && (
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium">地図を選択</Label>
            <RadioGroup
              value={saveImageTargetMapId}
              disabled={isGenerating}
              onValueChange={handleMapIdChange}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="main" id="save-map-main" />
                <Label htmlFor="save-map-main" className="cursor-pointer">
                  左の地図
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sub" id="save-map-sub" />
                <Label htmlFor="save-map-sub" className="cursor-pointer">
                  右の地図
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label className="text-xs font-medium">範囲</Label>
          <RadioGroup
            value={rangeMode}
            disabled={isGenerating}
            onValueChange={handleRangeModeChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="viewport" id="range-viewport" />
              <Label htmlFor="range-viewport" className="cursor-pointer">
                表示範囲全体
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bbox" id="range-bbox" />
              <Label htmlFor="range-bbox" className="cursor-pointer">
                範囲を指定
              </Label>
            </div>
          </RadioGroup>
        </div>

        {rangeMode === "bbox" && isSaveImageBBoxMode && <SaveImageBBoxInputs />}

        {rangeMode === "bbox" && !isBBoxValid && (
          <p className="text-destructive text-xs">
            北端は南端より大きく、東端は西端より大きい値を入力してください
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Label className="text-xs font-medium">オプション</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-scale-bar"
              checked={includeScaleBar}
              disabled={isGenerating}
              onCheckedChange={(checked) => {
                setIncludeScaleBar(checked === true);
              }}
            />
            <Label
              htmlFor="include-scale-bar"
              className="cursor-pointer text-sm"
            >
              スケールバーを含める
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-credit"
              checked={includeCredit}
              disabled={isGenerating}
              onCheckedChange={(checked) => {
                setIncludeCredit(checked === true);
              }}
            />
            <Label htmlFor="include-credit" className="cursor-pointer text-sm">
              出典を含める
            </Label>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="save-image-filename" className="text-xs font-medium">
            ファイル名
          </Label>
          <Input
            id="save-image-filename"
            className="h-8"
            value={filename}
            disabled={isGenerating}
            onChange={(e) => {
              setFilename(e.target.value);
            }}
          />
        </div>

        {previewUrl && (
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium">プレビュー</Label>
            <div className="rounded-md border overflow-hidden">
              <img
                src={previewUrl}
                alt="プレビュー"
                className="w-full h-auto"
              />
            </div>
          </div>
        )}

        <p className="text-muted-foreground text-xs">
          地理院タイルのご利用について：
          <a
            href="https://maps.gsi.go.jp/development/ichiran.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            https://maps.gsi.go.jp/development/ichiran.html
          </a>
        </p>

        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            disabled={isGenerating || !isBBoxValid}
            onClick={() => {
              void handleGenerate();
            }}
          >
            {isGenerating ? <Spinner /> : "画像を生成"}
          </Button>
          {previewUrl && (
            <Button
              size="sm"
              disabled={isGenerating || !filename}
              onClick={() => {
                void handleSavePng();
              }}
            >
              PNGを保存
            </Button>
          )}
        </div>
      </div>
    </Window>
  );
};
