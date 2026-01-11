import { TerraDraw, GeoJSONStoreFeatures } from "terra-draw";

const DEFAULT_FILL_COLOR = "#0011FF10";
const DEFAULT_OUTLINE_COLOR = "#0011FFFF";

export const getCircleModeStyle = (
  td: TerraDraw,
): Partial<{
  fillColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  fillOpacity: 1;
  outlineColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
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
    fillOpacity: 1,

    outlineColor: ({ id }) => {
      if (!id) return DEFAULT_OUTLINE_COLOR;
      const ss = td.getSnapshotFeature(id);
      const outlineColor = ss?.properties.outlineColor;

      if (
        outlineColor &&
        typeof outlineColor === "string" &&
        outlineColor.startsWith("#")
      ) {
        return ss.properties.outlineColor as `#${string}`;
      }

      td.updateFeatureProperties(id, { outlineColor: DEFAULT_OUTLINE_COLOR });
      return DEFAULT_OUTLINE_COLOR;
    },
  };
};
