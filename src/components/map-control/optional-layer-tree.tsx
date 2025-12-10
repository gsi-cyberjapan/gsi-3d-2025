"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { OptionalLayerEntry } from "@/lib/getOptionalLayers";
import { Folder, Layers } from "lucide-react";
import { useStore } from "@/hooks/store/useStore";
import { cn } from "@/lib/utils";

type LayerGroupEntry = Extract<OptionalLayerEntry, { type: "layer-group" }>;
type LayerEntry = Extract<OptionalLayerEntry, { type: "layer" }>;

const isLayerGroupEntry = (
  entry: OptionalLayerEntry,
): entry is LayerGroupEntry => entry.type === "layer-group";

const isLayerEntry = (entry: OptionalLayerEntry): entry is LayerEntry =>
  entry.type === "layer";

interface OptionalLayerTreeProps {
  entries: OptionalLayerEntry[];
}

export const OptionalLayerTree = ({ entries }: OptionalLayerTreeProps) => {
  return (
    <nav aria-label="オプションレイヤー" className="flex flex-col gap-2">
      <OptionalLayerBranch entries={entries} path="root" depth={0} />
    </nav>
  );
};

interface OptionalLayerBranchProps {
  entries: OptionalLayerEntry[];
  path: string;
  depth: number;
}

const OptionalLayerBranch = ({
  entries,
  path,
  depth,
}: OptionalLayerBranchProps) => {
  if (entries.length === 0) {
    return null;
  }

  const groups = entries.filter(isLayerGroupEntry);
  const layers = entries.filter(isLayerEntry);

  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        depth > 0 && "border-l border-blue-600 pl-4",
      )}
    >
      {layers.map((layer) => (
        <OptionalLayerLeaf key={`${path}-${layer.id}`} layer={layer} />
      ))}

      {groups.length > 0 && (
        <Accordion type="single" collapsible>
          {groups.map((group, index) => (
            <OptionalLayerGroupItem
              key={`${path}-${index.toString()}-${group.title}`}
              group={group}
              path={`${path}-${index.toString()}`}
              depth={depth + 1}
            />
          ))}
        </Accordion>
      )}
    </div>
  );
};

interface OptionalLayerGroupItemProps {
  group: LayerGroupEntry;
  path: string;
  depth: number;
}

const OptionalLayerGroupItem = ({
  group,
  path,
  depth,
}: OptionalLayerGroupItemProps) => {
  const value = toAccordionValue(path, group.title);

  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="gap-1 py-1 text-left font-normal">
        <OptionalLayerDirRow title={group.title} />
      </AccordionTrigger>
      <AccordionContent>
        <OptionalLayerBranch
          entries={group.entries}
          path={value}
          depth={depth + 1}
        />
      </AccordionContent>
    </AccordionItem>
  );
};

const OptionalLayerLeaf = ({ layer }: { layer: LayerEntry }) => {
  return <OptionalLayerLayerRow layer={layer} />;
};

const toAccordionValue = (path: string, title: string) =>
  `${path}-${title.replace(/\s+/g, "-").toLowerCase()}`;

interface OptionalLayerLayerRowProps {
  layer: LayerEntry;
}

export const OptionalLayerLayerRow = ({
  layer,
}: OptionalLayerLayerRowProps) => {
  const { id: layerId, title, tileUrl, minZoom, maxZoom } = layer;
  const focusMapId = useStore((state) => state.focusMapId);
  const optionalLayers = useStore(
    (state) => state.maps[focusMapId].optionalLayers,
  );
  const setOptionalLayer = useStore((state) => state.setOptionalLayer);
  const isSelected = optionalLayers.some((l) => l.layerId === layerId);

  const handleClick = () => {
    if (isSelected) {
      setOptionalLayer({
        mapId: focusMapId,
        layers: optionalLayers.filter((l) => l.layerId !== layerId),
      });
    } else {
      setOptionalLayer({
        mapId: focusMapId,
        layers: [
          ...optionalLayers,
          {
            layerId,
            title,
            tileUrl,
            maxZoom,
            minZoom,
            opacity: 0.5,
          },
        ],
      });
    }
  };

  return (
    <div
      className={cn(
        "flex gap-1 text-xs items-start cursor-pointer hover:opacity-80",
        isSelected && "text-blue-500",
      )}
      onClick={handleClick}
    >
      <Layers className="text-muted-foreground size-3 shrink-0 mt-0.5" />
      <span>{title}</span>
    </div>
  );
};

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
