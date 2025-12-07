import { getOptionalLayers } from "@/lib/getOptionalLayers";
import { OptionalLayerSelectorClient } from "./optional-layer-selector.client";

export const OptionalLayerSelector = async () => {
  const layers = await getOptionalLayers();

  return (
    <div className="border rounded-md p-2 max-h-100 overflow-y-scroll scrollbar-transparent-thin">
      <OptionalLayerSelectorClient entries={layers} />
    </div>
  );
};
