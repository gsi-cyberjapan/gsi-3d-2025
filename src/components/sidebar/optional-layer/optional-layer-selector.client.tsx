"use client";

import { Suspense, lazy, useEffect } from "react";
import {
  type OptionalLayerEntry,
  buildLayerMetadataCache,
} from "@/lib/getOptionalLayers";
import { Skeleton } from "@/components/ui/skeleton";

const OptionalLayerTree = lazy(() =>
  import("./optional-layer-tree").then((mod) => ({
    default: mod.OptionalLayerTree,
  })),
);

interface OptionalLayerSelectorClientProps {
  entries: OptionalLayerEntry[];
}

export const OptionalLayerSelectorClient = ({
  entries,
}: OptionalLayerSelectorClientProps) => {
  useEffect(() => {
    buildLayerMetadataCache(entries);
  }, [entries]);

  return (
    <Suspense fallback={<OptionalLayerTreeSkeleton count={entries.length} />}>
      <OptionalLayerTree entries={entries} />
    </Suspense>
  );
};

const OptionalLayerTreeSkeleton = ({ count }: { count: number }) => {
  const placeholderItems = Math.min(count, 10);

  return (
    <div className="flex flex-col gap-4 pt-2">
      {Array.from({ length: placeholderItems }).map((_, index) => (
        <Skeleton key={index.toString()} className="h-3 w-full" />
      ))}
    </div>
  );
};
