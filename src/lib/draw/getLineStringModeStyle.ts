import { TerraDraw, GeoJSONStoreFeatures } from "terra-draw";

const DEFAULT_LINESTRING_COLOR = "#0011FFFF";
const DEFAULT_LINESTRING_WIDTH = 2;

export const getLineStringModeStyle = (
  td: TerraDraw,
): Partial<{
  lineStringColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  lineStringWidth: (feature: GeoJSONStoreFeatures) => number;
}> => {
  return {
    lineStringColor: ({ id }) => {
      if (!id) return DEFAULT_LINESTRING_COLOR;
      const ss = td.getSnapshotFeature(id);
      const lineColor = ss?.properties.lineStringColor;

      if (
        lineColor &&
        typeof lineColor === "string" &&
        lineColor.startsWith("#")
      ) {
        return ss.properties.lineStringColor as `#${string}`;
      }

      td.updateFeatureProperties(id, {
        lineStringColor: DEFAULT_LINESTRING_COLOR,
      });
      return DEFAULT_LINESTRING_COLOR;
    },

    lineStringWidth: ({ id }) => {
      if (!id) return DEFAULT_LINESTRING_WIDTH;
      const ss = td.getSnapshotFeature(id);
      const lineWidth = ss?.properties.lineStringWidth;

      if (typeof lineWidth === "number") {
        return lineWidth;
      }

      td.updateFeatureProperties(id, {
        lineStringWidth: DEFAULT_LINESTRING_WIDTH,
      });
      return DEFAULT_LINESTRING_WIDTH;
    },
  };
};
