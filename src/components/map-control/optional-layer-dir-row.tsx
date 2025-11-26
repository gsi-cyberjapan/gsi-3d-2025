"use client";

import { Folder } from "lucide-react";

interface OptionalLayerDirRowProps {
  title: string;
}

export const OptionalLayerDirRow = ({ title }: OptionalLayerDirRowProps) => {
  return (
    <div className="flex gap-1 text-xs items-start">
      <Folder className="text-muted-foreground size-3 shrink-0 mt-0.5" />
      <span>{title}</span>
    </div>
  );
};
