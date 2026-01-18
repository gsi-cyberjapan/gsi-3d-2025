"use client";

import { useState } from "react";
import { Download, FolderInput } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DrawDownloadDialog } from "./draw-download-dialog";
import { DrawUploadDialog } from "./draw-upload-dialog";

export const DrawFileButton = () => {
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-muted text-muted-foreground inline-flex h-6 w-fit items-center justify-center rounded-sm p-[3px]">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                setIsUploadDialogOpen(true);
              }}
              className="text-xs size-5 rounded-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring hover:bg-background hover:text-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 border border-transparent px-2 py-1 font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            >
              <FolderInput />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>ファイルから作図データを読み込む</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                setIsDownloadDialogOpen(true);
              }}
              className="text-xs size-5 rounded-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring hover:bg-background hover:text-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 border border-transparent px-2 py-1 font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            >
              <Download />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>作図データのダウンロード</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <DrawUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
      />
      <DrawDownloadDialog
        open={isDownloadDialogOpen}
        onOpenChange={setIsDownloadDialogOpen}
      />
    </div>
  );
};
