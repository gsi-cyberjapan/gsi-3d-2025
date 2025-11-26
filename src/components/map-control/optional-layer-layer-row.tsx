"use client";

import { Layers } from "lucide-react";

interface OptionalLayerLayerRowProps {
  title: string;
}

export const OptionalLayerLayerRow = ({
  title,
}: OptionalLayerLayerRowProps) => {
  return (
    <div className="flex gap-1 text-xs items-start">
      <Layers className="text-muted-foreground size-3 shrink-0 mt-0.5" />
      <span>{title}</span>
    </div>
  );
};
