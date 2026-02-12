"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useStore } from "@/hooks/store/useStore";
import { MapId } from "@/hooks/store/mapManagerState";
import { useMap } from "react-map-gl/maplibre";
import {
  captureMapCanvas,
  cropCanvasToBBox,
  drawScaleBar,
  drawCredit,
  generateWorldFile,
  canvasToBlob,
  downloadBlob,
  downloadText,
  type SaveImageBBox,
} from "@/lib/saveImage";
import { SaveImageBBoxInputs } from "./save-image-bbox-inputs";

type RangeMode = "viewport" | "bbox";

export const SaveImageDialog = () => {
  const isSaveImageDialogOpen = useStore(
    (state) => state.isSaveImageDialogOpen,
  );
  const setIsSaveImageDialogOpen = useStore(
    (state) => state.setIsSaveImageDialogOpen,
  );
  const layoutMode = useStore((state) => state.layoutMode);
  const isSplitMode = layoutMode === "split" || layoutMode === "overlay";

  const maps = useMap();

  const [selectedMapId, setSelectedMapId] = useState<MapId>("main");
  const [rangeMode, setRangeMode] = useState<RangeMode>("viewport");
  const [bbox, setBbox] = useState<SaveImageBBox>({
    north: 0,
    south: 0,
    east: 0,
    west: 0,
  });
  const [filename, setFilename] = useState("map-image");
  const [includeScaleBar, setIncludeScaleBar] = useState(true);
  const [includeCredit, setIncludeCredit] = useState(true);
  const [includeWorldFile, setIncludeWorldFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCanvas, setGeneratedCanvas] =
    useState<HTMLCanvasElement | null>(null);

  const getMap = useCallback(() => {
    return maps[selectedMapId]?.getMap() ?? null;
  }, [maps, selectedMapId]);

  const initBBoxFromMap = useCallback(() => {
    const map = getMap();
    if (!map) return;
    const bounds = map.getBounds();
    setBbox({
      north: Math.round(bounds.getNorth() * 10000) / 10000,
      south: Math.round(bounds.getSouth() * 10000) / 10000,
      east: Math.round(bounds.getEast() * 10000) / 10000,
      west: Math.round(bounds.getWest() * 10000) / 10000,
    });
  }, [getMap]);

  const handleRangeModeChange = useCallback(
    (value: string) => {
      setRangeMode(value as RangeMode);
      if (value === "bbox") {
        initBBoxFromMap();
      }
      setPreviewUrl(null);
      setGeneratedCanvas(null);
    },
    [initBBoxFromMap],
  );

  const handleGenerate = useCallback(async () => {
    const map = getMap();
    if (!map) return;

    setIsGenerating(true);
    try {
      // Small delay to allow UI update
      await new Promise((resolve) => setTimeout(resolve, 50));

      let canvas = captureMapCanvas(map);

      if (rangeMode === "bbox") {
        canvas = cropCanvasToBBox(canvas, map, bbox);
      }

      const center = map.getCenter();
      const zoom = map.getZoom();

      if (includeScaleBar) {
        drawScaleBar(canvas, center.lat, zoom);
      }

      if (includeCredit) {
        drawCredit(canvas);
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
  }, [getMap, rangeMode, bbox, includeScaleBar, includeCredit, previewUrl]);

  const handleSavePng = useCallback(async () => {
    if (!generatedCanvas) return;
    const blob = await canvasToBlob(generatedCanvas);
    downloadBlob(blob, `${filename}.png`);
  }, [generatedCanvas, filename]);

  const handleSavePgw = useCallback(() => {
    const map = getMap();
    if (!map || !generatedCanvas) return;

    const dpr = window.devicePixelRatio;
    const imageWidth = generatedCanvas.width / dpr;
    const imageHeight = generatedCanvas.height / dpr;

    const content = generateWorldFile(
      map,
      imageWidth,
      imageHeight,
      rangeMode === "bbox" ? bbox : undefined,
    );
    downloadText(content, `${filename}.pgw`, "text/plain");
  }, [getMap, generatedCanvas, rangeMode, bbox, filename]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        // Clean up preview URL when closing
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setGeneratedCanvas(null);
      }
      setIsSaveImageDialogOpen(open);
    },
    [setIsSaveImageDialogOpen, previewUrl],
  );

  const isBBoxValid =
    rangeMode !== "bbox" || (bbox.north > bbox.south && bbox.east > bbox.west);

  return (
    <Dialog open={isSaveImageDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg p-4">
        <DialogHeader>
          <DialogTitle>画像として保存</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {isSplitMode && (
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">地図を選択</Label>
              <RadioGroup
                value={selectedMapId}
                disabled={isGenerating}
                onValueChange={(value) => {
                  setSelectedMapId(value as MapId);
                  setPreviewUrl(null);
                  setGeneratedCanvas(null);
                }}
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
            <Label className="text-sm font-medium">範囲</Label>
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

          {rangeMode === "bbox" && (
            <SaveImageBBoxInputs bbox={bbox} onChange={setBbox} />
          )}

          {rangeMode === "bbox" && !isBBoxValid && (
            <p className="text-destructive text-xs">
              北緯は南緯より大きく、東経は西経より大きい値を入力してください
            </p>
          )}

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">オプション</Label>
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
              <Label
                htmlFor="include-credit"
                className="cursor-pointer text-sm"
              >
                出典を含める
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-world-file"
                checked={includeWorldFile}
                disabled={isGenerating}
                onCheckedChange={(checked) => {
                  setIncludeWorldFile(checked === true);
                }}
              />
              <Label
                htmlFor="include-world-file"
                className="cursor-pointer text-sm"
              >
                ワールドファイル(.pgw)も保存
              </Label>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="save-image-filename"
              className="text-sm font-medium"
            >
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
              <Label className="text-sm font-medium">プレビュー</Label>
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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            disabled={isGenerating}
            onClick={() => {
              handleOpenChange(false);
            }}
          >
            キャンセル
          </Button>
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
            <>
              <Button
                size="sm"
                disabled={isGenerating || !filename}
                onClick={() => {
                  void handleSavePng();
                }}
              >
                PNGを保存
              </Button>
              {includeWorldFile && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isGenerating || !filename}
                  onClick={handleSavePgw}
                >
                  PGWを保存
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
