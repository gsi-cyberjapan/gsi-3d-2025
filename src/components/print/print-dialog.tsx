"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/hooks/store/useStore";
import { useMap } from "react-map-gl/maplibre";
import {
  getMaplibreWithProtocol,
  type MapLibreType,
} from "@/lib/getMaplibreWhithProtocol";
import {
  PAPER_SIZES,
  getTitleHeight,
  renderHighResMap,
  composePrintCanvas,
  openPrintWindow,
  writeToPrintWindow,
} from "@/lib/printMap";
import { POINT_CLOUD_CONFIG } from "@/lib/config";
import { getVisibleTileEntries } from "@/lib/pointcloud/tilesIndex";

const PREVIEW_MAX_WIDTH = 600;
const PREVIEW_MAX_HEIGHT = 400;

export const PrintDialog = () => {
  const isPrintDialogOpen = useStore((state) => state.isPrintDialogOpen);
  const setIsPrintDialogOpen = useStore((state) => state.setIsPrintDialogOpen);
  const isPointCloudEnabled = useStore(
    (state) => state.maps.main.isPointCloudEnabled,
  );

  const maps = useMap();

  const [paperSizeId, setPaperSizeId] = useState(PAPER_SIZES[0].id);
  const [title, setTitle] = useState("");
  const [showCompass, setShowCompass] = useState(true);
  const [mapLib, setMapLib] = useState<MapLibreType | null>(null);

  const [previewContainer, setPreviewContainer] =
    useState<HTMLDivElement | null>(null);
  const previewMapRef = useRef<maplibregl.Map | null>(null);

  const paperSize =
    PAPER_SIZES.find((p) => p.id === paperSizeId) ?? PAPER_SIZES[0];

  const titleH = getTitleHeight(title, paperSize.dpi);
  const previewMapHeight = paperSize.height - titleH;

  const previewDims = useMemo(() => {
    const ratio = paperSize.width / previewMapHeight;
    let h = PREVIEW_MAX_HEIGHT;
    let w = h * ratio;
    if (w > PREVIEW_MAX_WIDTH) {
      w = PREVIEW_MAX_WIDTH;
      h = w / ratio;
    }
    return { width: Math.round(w), height: Math.round(h) };
  }, [paperSize.width, previewMapHeight]);

  // Load MapLibre library
  useEffect(() => {
    let cancelled = false;
    getMaplibreWithProtocol()
      .then((lib) => {
        if (!cancelled) {
          setMapLib(lib);
        }
      })
      .catch((err: unknown) => {
        console.error("Failed to load maplibre for print preview:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Initialize preview map when dialog opens
  // Uses callback ref (setPreviewContainer) so this effect re-runs
  // after Radix Portal mounts the DialogContent into the DOM.
  useEffect(() => {
    if (!isPrintDialogOpen || !mapLib || !previewContainer) return;

    const mainMap = maps.main?.getMap();
    if (!mainMap) return;

    const style = mainMap.getStyle();
    const center = mainMap.getCenter();
    const zoom = mainMap.getZoom();
    const bearing = mainMap.getBearing();
    const pitch = mainMap.getPitch();

    const previewMap = new mapLib.Map({
      container: previewContainer,
      style,
      center: [center.lng, center.lat],
      zoom,
      bearing,
      pitch,
      interactive: true,
      attributionControl: false,
    });

    previewMapRef.current = previewMap;

    const observer = new ResizeObserver(() => {
      previewMap.resize();
    });
    observer.observe(previewContainer);

    return () => {
      observer.disconnect();
      previewMapRef.current = null;
      previewMap.remove();
    };
  }, [isPrintDialogOpen, mapLib, maps.main, previewContainer]);

  const handlePrint = useCallback(async () => {
    const previewMap = previewMapRef.current;
    if (!previewMap || !previewContainer) return;

    // Open window synchronously within the user gesture context
    const printWindow = openPrintWindow();
    if (!printWindow) {
      alert(
        "ポップアップがブロックされました。ポップアップブロッカーを無効にしてもう一度お試しください。",
      );
      return;
    }

    // 元タブにフォーカスを戻し、rAF スロットルを防ぐ
    window.focus();

    try {
      const center = previewMap.getCenter();
      const zoom = previewMap.getZoom();
      const bearing = previewMap.getBearing();
      const pitch = previewMap.getPitch();
      const style = previewMap.getStyle();

      const titleH = getTitleHeight(title, paperSize.dpi);
      const mapHeight = paperSize.height - titleH;
      const previewWidth = previewContainer.clientWidth;
      const adjustedZoom = zoom + Math.log2(paperSize.width / previewWidth);

      const setupOverlay = isPointCloudEnabled
        ? async (offscreenMap: maplibregl.Map) => {
            const [{ MapboxOverlay }, { Tile3DLayer }] = await Promise.all([
              import("@deck.gl/mapbox"),
              import("@deck.gl/geo-layers"),
            ]);

            const visibleTiles = await getVisibleTileEntries(offscreenMap);
            const layers = visibleTiles.map(
              (t) =>
                new Tile3DLayer({
                  id: `print-pointcloud-${t.name}`,
                  data: `${POINT_CLOUD_CONFIG.TILESET_BASE_URL}/${t.name}/tileset.json`,
                  pointSize: 1,
                }),
            );

            const overlay = new MapboxOverlay({
              interleaved: true,
              layers,
            });
            offscreenMap.addControl(overlay as unknown as maplibregl.IControl);
          }
        : undefined;

      const mapCanvas = await renderHighResMap({
        style,
        center: [center.lng, center.lat],
        zoom: adjustedZoom,
        bearing,
        pitch,
        width: paperSize.width,
        height: mapHeight,
        setupOverlay,
      });

      const printCanvas = composePrintCanvas({
        mapCanvas,
        title,
        showCompass,
        bearing,
        latitude: center.lat,
        zoom: adjustedZoom,
        paper: paperSize,
      });

      writeToPrintWindow(printWindow, printCanvas, paperSize);
    } catch (err) {
      printWindow.close();
      console.error("Print failed:", err);
      alert(
        "印刷に失敗しました。用紙サイズを小さくするか、標準画質をお試しください。",
      );
    }
  }, [paperSize, title, showCompass, previewContainer, isPointCloudEnabled]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsPrintDialogOpen(open);
    },
    [setIsPrintDialogOpen],
  );

  return (
    <Dialog open={isPrintDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-4">
        <DialogHeader>
          <DialogTitle>印刷</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto scrollbar-transparent-thin">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">用紙サイズ</Label>
            <Select value={paperSizeId} onValueChange={setPaperSizeId}>
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAPER_SIZES.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="print-title" className="text-sm font-medium">
              タイトル
            </Label>
            <Input
              id="print-title"
              className="h-8"
              placeholder="タイトルを入力（任意）"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="print-compass"
              checked={showCompass}
              onCheckedChange={(checked) => {
                setShowCompass(checked === true);
              }}
            />
            <Label htmlFor="print-compass" className="cursor-pointer text-sm">
              方位記号を含める
            </Label>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">プレビュー</Label>
            <div
              ref={setPreviewContainer}
              className="rounded-md border overflow-hidden bg-muted mx-auto"
              style={{
                width: previewDims.width,
                maxWidth: "100%",
                aspectRatio: `${String(previewDims.width)} / ${String(previewDims.height)}`,
              }}
            />
          </div>

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
            onClick={() => {
              handleOpenChange(false);
            }}
          >
            キャンセル
          </Button>
          <Button
            size="sm"
            onClick={() => {
              void handlePrint();
            }}
          >
            印刷
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
