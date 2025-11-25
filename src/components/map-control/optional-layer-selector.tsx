import { getOptionalLayers } from "@/lib/getOptionalLayers";

export const OptionalLayerSelector = async () => {
  const layers = await getOptionalLayers();
  return <div>{JSON.stringify(layers)}</div>;
};
