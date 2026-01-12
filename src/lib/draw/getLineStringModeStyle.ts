import { TerraDraw, GeoJSONStoreFeatures } from "terra-draw";

const DEFAULT_LINESTRING_COLOR = "#0011FFFF";
const DEFAULT_LINESTRING_WIDTH = 2;
const DEFAULT_CLOSING_POINT_COLOR = "#FFFFFFFF";
const DEFAULT_SNAPPINGT_POINT_COLOR = "#FFFFFFFF";
const DEFAULT_CLOSING_POINT_OUTLINE_COLOR = "#0011FFFF";
const DEFAULT_SNAPPING_POINT_OUTLINE_COLOR = "#0011FFFF";

export const getLineStringModeStyle = (
  td: TerraDraw,
): Partial<{
  lineStringColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  lineStringWidth: (feature: GeoJSONStoreFeatures) => number;
  snappingPointColor: `#${string}`;
  snappingPointOutlineColor: `#${string}`;
  closingPointColor: `#${string}`;
  closingPointOutlineColor: `#${string}`;
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
    closingPointColor: DEFAULT_CLOSING_POINT_COLOR,
    closingPointOutlineColor: DEFAULT_CLOSING_POINT_OUTLINE_COLOR,
    snappingPointColor: DEFAULT_SNAPPINGT_POINT_COLOR,
    snappingPointOutlineColor: DEFAULT_SNAPPING_POINT_OUTLINE_COLOR,
  };
};
