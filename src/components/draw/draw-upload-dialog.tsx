"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useStore } from "@/hooks/store/useStore";
import { MapId } from "@/hooks/store/mapManagerState";
import { importDrawData, ImportFormat, ImportResult } from "@/lib/importDraw";

interface DrawUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DrawUploadDialog = ({
  open,
  onOpenChange,
}: DrawUploadDialogProps) => {
  const layoutMode = useStore((state) => state.layoutMode);
  const mainTd = useStore((state) => state.maps.main.td);
  const subTd = useStore((state) => state.maps.sub.td);
  const isSplitMode = layoutMode === "split" || layoutMode === "overlay";

  const [selectedMapId, setSelectedMapId] = useState<MapId>("main");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ImportResult | null>(null);

  const td = selectedMapId === "main" ? mainTd : subTd;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setUploadResult(null);
      return;
    }

    // Validate file extension
    const allowedExtensions = [".geojson", ".json", ".kml"];
    const fileExtension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      setUploadResult({
        added: 0,
        failed: 0,
        errors: [
          "サポートされていないファイル形式です (.geojson, .json, .kml のみ)",
        ],
      });
      setSelectedFile(null);
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadResult({
        added: 0,
        failed: 0,
        errors: ["ファイルサイズが大きすぎます (最大10MB)"],
      });
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
  };

  const detectFormat = (filename: string): ImportFormat => {
    const extension = filename.toLowerCase().match(/\.[^.]+$/)?.[0];
    return extension === ".kml" ? "kml" : "geojson";
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === "string") {
          resolve(content);
        } else {
          reject(new Error("ファイルの読み込みに失敗しました"));
        }
      };

      reader.onerror = () => {
        reject(new Error("ファイルの読み込みに失敗しました"));
      };

      reader.readAsText(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !td) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      // Read file
      const content = await readFile(selectedFile);

      // Detect format
      const format = detectFormat(selectedFile.name);

      // Import features
      const result = importDrawData(
        td,
        content,
        format,
        selectedFile.name,
        selectedMapId,
      );

      // Force style re-evaluation for imported features
      // TerraDraw only evaluates styles when modes are active
      // We temporarily cycle through modes to trigger style application
      if (result.added > 0) {
        const currentMode = td.getMode();

        // Briefly switch to select mode and back to trigger style re-evaluation
        // This forces TerraDraw to re-render all features with their style functions
        td.setMode("select");

        // Use setTimeout to ensure the mode change is processed
        setTimeout(() => {
          td.setMode(currentMode);
        }, 0);
      }

      // Update UI
      setUploadResult(result);

      // Auto-close dialog on successful upload
      if (result.added > 0 && result.failed === 0) {
        setTimeout(() => {
          handleClose();
        }, 500);
      }
    } catch (error) {
      // Handle error
      setUploadResult({
        added: 0,
        failed: 0,
        errors: [
          error instanceof Error ? error.message : "不明なエラーが発生しました",
        ],
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setSelectedMapId("main");
  };

  const handleClose = () => {
    if (!isUploading) {
      resetDialog();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={isUploading ? undefined : handleClose}>
      <DialogContent className="max-w-lg p-4">
        <DialogHeader>
          <DialogTitle>作図データのアップロード</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {isSplitMode && (
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">地図を選択</Label>
              <RadioGroup
                value={selectedMapId}
                disabled={isUploading}
                onValueChange={(value) => {
                  setSelectedMapId(value as MapId);
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="main" id="upload-map-main" />
                  <Label htmlFor="upload-map-main" className="cursor-pointer">
                    左の地図
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sub" id="upload-map-sub" />
                  <Label htmlFor="upload-map-sub" className="cursor-pointer">
                    右の地図
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">ファイルを選択</Label>
            <Input
              type="file"
              accept=".geojson,.json,.kml"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            {selectedFile && (
              <p className="text-muted-foreground text-xs">
                選択されたファイル: {selectedFile.name}
              </p>
            )}
            {!selectedFile && !uploadResult && (
              <p className="text-muted-foreground text-xs">
                ファイルが選択されていません
              </p>
            )}
          </div>

          {uploadResult && (
            <div className="flex flex-col gap-2">
              {uploadResult.added > 0 && (
                <p className="text-sm">
                  {uploadResult.added}件のフィーチャを追加しました
                </p>
              )}
              {uploadResult.failed > 0 && (
                <div className="text-destructive text-sm">
                  <p>
                    {uploadResult.failed}件のフィーチャを追加できませんでした
                  </p>
                  {uploadResult.errors.length > 0 && (
                    <ul className="list-disc pl-4 mt-1">
                      {uploadResult.errors.slice(0, 5).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  )}
                  {uploadResult.errors.length > 5 && (
                    <p className="mt-1">
                      ...他{uploadResult.errors.length - 5}件
                    </p>
                  )}
                </div>
              )}
              {uploadResult.added === 0 && uploadResult.failed === 0 && (
                <p className="text-muted-foreground text-sm">
                  インポート可能なフィーチャがありませんでした
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={handleClose}
          >
            キャンセル
          </Button>
          <Button
            size="sm"
            className="w-26"
            onClick={() => {
              void handleUpload();
            }}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? <Spinner /> : "アップロード"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
