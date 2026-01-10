import { TerraDraw, GeoJSONStoreFeatures } from "terra-draw";

const DEFAULT_FILL_COLOR = "#3449eb";

export const getCircleModeStyle = (
  td: TerraDraw,
): Partial<{
  fillColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
}> => {
  return {
    fillColor: ({ id }) => {
      if (!id) return DEFAULT_FILL_COLOR;
      const ss = td.getSnapshotFeature(id);
      const fillColor = ss?.properties.fillColor;

      if (
        fillColor &&
        typeof fillColor === "string" &&
        fillColor.startsWith("#")
      ) {
        return ss.properties.fillColor as `#${string}`;
      }

      td.updateFeatureProperties(id, { fillColor: DEFAULT_FILL_COLOR });
      return DEFAULT_FILL_COLOR;
    },
  };
};
