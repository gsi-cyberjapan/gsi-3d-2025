"use client";

import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getLayerMetadata } from "@/lib/getOptionalLayers";

interface LayerInfoPopoverProps {
  layerId: string;
}

export const LayerInfoPopover = ({ layerId }: LayerInfoPopoverProps) => {
  const metadata = getLayerMetadata(layerId);

  if (!metadata) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="cursor-pointer text-muted-foreground border rounded-sm p-0.5"
          aria-label="レイヤー情報を表示"
        >
          <Info className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-3 w-72 max-h-80 overflow-y-auto">
        <div className="flex flex-col gap-2 text-xs">
          {metadata.html && (
            <div
              className="layer-info-html prose prose-xs max-w-none [&_a]:text-blue-600 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: metadata.html }}
            />
          )}
          {metadata.legendUrl && (
            <a
              href={metadata.legendUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-xs"
            >
              凡例を表示
            </a>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
