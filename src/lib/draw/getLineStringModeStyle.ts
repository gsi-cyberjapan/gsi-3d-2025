import { TerraDraw, GeoJSONStoreFeatures } from "terra-draw";
import { colorToRgba } from "@/lib/colorConverter";
import { isFeatureHidden } from "./getPolygonModeStyle";

const TRANSPARENT = "#00000000" as const;

// Default simplestyle values
export const DEFAULT_STROKE = "#0011FF";
export const DEFAULT_STROKE_OPACITY = 1;
export const DEFAULT_STROKE_WIDTH = 2;

const DEFAULT_CLOSING_POINT_COLOR = "#FFFFFFFF";
const DEFAULT_SNAPPING_POINT_COLOR = "#FFFFFFFF";
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
      if (!id) return colorToRgba(DEFAULT_STROKE, DEFAULT_STROKE_OPACITY);
      if (isFeatureHidden(td, id)) return TRANSPARENT;

      const ss = td.getSnapshotFeature(id);
      const stroke = ss?.properties.stroke;
      const strokeOpacity = ss?.properties["stroke-opacity"];

      if (stroke && typeof stroke === "string" && stroke.startsWith("#")) {
        const opacity =
          typeof strokeOpacity === "number"
            ? strokeOpacity
            : DEFAULT_STROKE_OPACITY;
        return colorToRgba(stroke, opacity);
      }

      td.updateFeatureProperties(id, {
        stroke: DEFAULT_STROKE,
        "stroke-opacity": DEFAULT_STROKE_OPACITY,
      });
      return colorToRgba(DEFAULT_STROKE, DEFAULT_STROKE_OPACITY);
    },

    lineStringWidth: ({ id }) => {
      if (!id) return DEFAULT_STROKE_WIDTH;
      if (isFeatureHidden(td, id)) return 0;

      const ss = td.getSnapshotFeature(id);
      const strokeWidth = ss?.properties["stroke-width"];

      if (typeof strokeWidth === "number") {
        return strokeWidth;
      }

      td.updateFeatureProperties(id, { "stroke-width": DEFAULT_STROKE_WIDTH });
      return DEFAULT_STROKE_WIDTH;
    },
    closingPointColor: DEFAULT_CLOSING_POINT_COLOR,
    closingPointOutlineColor: DEFAULT_CLOSING_POINT_OUTLINE_COLOR,
    snappingPointColor: DEFAULT_SNAPPING_POINT_COLOR,
    snappingPointOutlineColor: DEFAULT_SNAPPING_POINT_OUTLINE_COLOR,
  };
};
