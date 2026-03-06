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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import {
  addCustomLayer,
  fetchAndValidate,
  parseAndValidate,
  getZoomRange,
  MAX_CUSTOM_LAYERS,
  type CustomLayerStorageItem,
} from "@/lib/customBaseLayers";

interface CustomLayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCount: number;
  onLayerAdded: (layer: CustomLayerStorageItem) => void;
}

export const CustomLayerDialog = ({
  open,
  onOpenChange,
  currentCount,
  onLayerAdded,
}: CustomLayerDialogProps) => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"url" | "file">("url");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAdd = currentCount < MAX_CUSTOM_LAYERS;

  const resetDialog = () => {
    setName("");
    setUrl("");
    setSelectedFile(null);
    setActiveTab("url");
    setError(null);
  };

  const handleClose = () => {
    if (!isLoading) {
      resetDialog();
      onOpenChange(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file extension
    const fileExtension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
    if (fileExtension !== ".json") {
      setError("JSON ファイル (.json) のみ対応しています");
      setSelectedFile(null);
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("ファイルサイズが大きすぎます (最大5MB)");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
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

  const handleAdd = async () => {
    if (!name.trim()) {
      setError("スタイル名を入力してください");
      return;
    }

    if (!canAdd) {
      setError(`最大 ${String(MAX_CUSTOM_LAYERS)} 件まで登録できます`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (activeTab === "url") {
        // URL mode
        if (!url.trim()) {
          setError("URL を入力してください");
          setIsLoading(false);
          return;
        }

        const result = await fetchAndValidate(url.trim());
        if (!result.success) {
          setError(result.error);
          setIsLoading(false);
          return;
        }

        const zoomRange = getZoomRange(result.format, result.data);

        const newLayer = addCustomLayer({
          label: name.trim(),
          sourceType: result.format,
          source: "url",
          data:
            result.format === "tilejson"
              ? JSON.stringify(result.data)
              : url.trim(),
          minZoom: zoomRange.minZoom,
          maxZoom: zoomRange.maxZoom,
        });

        onLayerAdded(newLayer);
        handleClose();
      } else {
        // File mode
        if (!selectedFile) {
          setError("ファイルを選択してください");
          setIsLoading(false);
          return;
        }

        const content = await readFile(selectedFile);
        const result = parseAndValidate(content);
        if (!result.success) {
          setError(result.error);
          setIsLoading(false);
          return;
        }

        const zoomRange = getZoomRange(result.format, result.data);

        const newLayer = addCustomLayer({
          label: name.trim(),
          sourceType: result.format,
          source: "file",
          data: content,
          minZoom: zoomRange.minZoom,
          maxZoom: zoomRange.maxZoom,
        });

        onLayerAdded(newLayer);
        handleClose();
      }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "不明なエラーが発生しました";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : handleClose}>
      <DialogContent className="max-w-lg p-4">
        <DialogHeader>
          <DialogTitle>カスタムスタイルの追加</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="custom-layer-name" className="text-sm font-medium">
              スタイル名
            </Label>
            <Input
              id="custom-layer-name"
              placeholder="マイスタイル"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              disabled={isLoading}
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v as "url" | "file");
            }}
          >
            <TabsList className="w-full">
              <TabsTrigger value="url" className="flex-1" disabled={isLoading}>
                URL
              </TabsTrigger>
              <TabsTrigger value="file" className="flex-1" disabled={isLoading}>
                ファイル
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="custom-layer-url"
                  className="text-sm font-medium"
                >
                  スタイル URL
                </Label>
                <Input
                  id="custom-layer-url"
                  placeholder="https://example.com/style.json"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                  }}
                  disabled={isLoading}
                />
                <p className="text-muted-foreground text-xs">
                  TileJSON（ラスタータイルのみ）または MapLibre Style
                  Specification 形式の URL
                </p>
              </div>
            </TabsContent>

            <TabsContent value="file">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="custom-layer-file"
                  className="text-sm font-medium"
                >
                  ファイルを選択
                </Label>
                <Input
                  id="custom-layer-file"
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  disabled={isLoading}
                />
                {selectedFile && (
                  <p className="text-muted-foreground text-xs">
                    選択されたファイル: {selectedFile.name}
                  </p>
                )}
                {!selectedFile && (
                  <p className="text-muted-foreground text-xs">
                    TileJSON（ラスタータイルのみ）または MapLibre Style
                    Specification 形式の JSON ファイル
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={handleClose}
          >
            キャンセル
          </Button>
          <Button
            size="sm"
            className="w-20"
            onClick={() => {
              void handleAdd();
            }}
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? <Spinner /> : "追加"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
