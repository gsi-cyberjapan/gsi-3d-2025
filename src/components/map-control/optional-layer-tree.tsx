"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { OptionalLayerEntry } from "@/lib/getOptionalLayers";
import { OptionalLayerDirRow } from "./optional-layer-dir-row";
import { OptionalLayerLayerRow } from "./optional-layer-layer-row";

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
  return <OptionalLayerLayerRow title={layer.title} />;
};

const toAccordionValue = (path: string, title: string) =>
  `${path}-${title.replace(/\s+/g, "-").toLowerCase()}`;
