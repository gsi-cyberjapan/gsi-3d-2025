"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useStore } from "@/hooks/store/useStore";
import { MapId } from "@/hooks/store/mapManagerState";
import {
  downloadDrawDataAsync,
  getExportContent,
  ExportFormat,
} from "@/lib/exportDraw";

interface DrawDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DrawDownloadDialog = ({
  open,
  onOpenChange,
}: DrawDownloadDialogProps) => {
  const layoutMode = useStore((state) => state.layoutMode);
  const mainTd = useStore((state) => state.maps.main.td);
  const subTd = useStore((state) => state.maps.sub.td);
  const isSplitMode = layoutMode === "split" || layoutMode === "overlay";

  const [selectedMapId, setSelectedMapId] = useState<MapId>("main");
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("geojson");
  const [isDownloading, setIsDownloading] = useState(false);

  const td = selectedMapId === "main" ? mainTd : subTd;
  const hasFeatures = td && td.getSnapshot().length > 0;

  const previewContent = useMemo(() => {
    if (!td || !hasFeatures) return "";
    return getExportContent(td, selectedFormat);
  }, [td, hasFeatures, selectedFormat]);

  const handleDownload = async () => {
    if (!td) return;

    setIsDownloading(true);
    try {
      await downloadDrawDataAsync(td, selectedFormat);
      onOpenChange(false);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={isDownloading ? undefined : onOpenChange}>
      <DialogContent className="max-w-lg p-4">
        <DialogHeader>
          <DialogTitle>作図データのダウンロード</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {isSplitMode && (
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">地図を選択</Label>
              <RadioGroup
                value={selectedMapId}
                disabled={isDownloading}
                onValueChange={(value) => {
                  setSelectedMapId(value as MapId);
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="main" id="map-main" />
                  <Label htmlFor="map-main" className="cursor-pointer">
                    左の地図
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sub" id="map-sub" />
                  <Label htmlFor="map-sub" className="cursor-pointer">
                    右の地図
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">ファイル形式</Label>
            <RadioGroup
              value={selectedFormat}
              disabled={isDownloading}
              onValueChange={(value) => {
                setSelectedFormat(value as ExportFormat);
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="geojson" id="format-geojson" />
                <Label htmlFor="format-geojson" className="cursor-pointer">
                  GeoJSON (.geojson)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="kml" id="format-kml" />
                <Label htmlFor="format-kml" className="cursor-pointer">
                  KML (.kml)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {hasFeatures && (
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">プレビュー</Label>
              <pre className="bg-muted max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-md p-3 text-xs">
                <code>{previewContent}</code>
              </pre>
            </div>
          )}

          {!hasFeatures && (
            <p className="text-muted-foreground text-sm">
              作図データがありません
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            disabled={isDownloading}
            onClick={() => {
              onOpenChange(false);
            }}
          >
            キャンセル
          </Button>
          <Button
            size="sm"
            className="w-26"
            onClick={() => {
              void handleDownload();
            }}
            disabled={!hasFeatures || isDownloading}
          >
            {isDownloading ? <Spinner /> : "ダウンロード"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
