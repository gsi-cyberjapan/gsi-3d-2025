import { TerraDraw, GeoJSONStoreFeatures } from "terra-draw";
import { colorToRgba } from "@/lib/colorConverter";
import {
  DEFAULT_FILL,
  DEFAULT_FILL_OPACITY,
  DEFAULT_STROKE,
  DEFAULT_STROKE_OPACITY,
  DEFAULT_STROKE_WIDTH,
  isFeatureHidden,
} from "./getPolygonModeStyle";

const TRANSPARENT = "#00000000" as const;

// Selection highlight color
const SELECTION_COLOR = "#FF6600";
const SELECTION_HANDLE_COLOR = "#FFFFFFFF";
const SELECTION_HANDLE_OUTLINE_COLOR = "#FF6600FF";
const MIDPOINT_COLOR = "#FFFFFFCC";
const MIDPOINT_OUTLINE_COLOR = "#FF6600FF";

export const getSelectModeStyle = (
  td: TerraDraw,
): Partial<{
  // Polygon styles
  polygonFillColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  polygonFillOpacity: 1;
  polygonOutlineColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  polygonOutlineWidth: (feature: GeoJSONStoreFeatures) => number;
  // LineString styles
  lineStringColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  lineStringWidth: (feature: GeoJSONStoreFeatures) => number;
  // Point styles
  pointColor: `#${string}`;
  pointOutlineColor: `#${string}`;
  pointWidth: number;
  pointOutlineWidth: number;
  // Selection point (vertex handle) styles
  selectionPointColor: `#${string}`;
  selectionPointOutlineColor: `#${string}`;
  selectionPointWidth: number;
  selectionPointOutlineWidth: number;
  // Midpoint styles
  midPointColor: `#${string}`;
  midPointOutlineColor: `#${string}`;
  midPointWidth: number;
  midPointOutlineWidth: number;
}> => {
  return {
    // Polygon styles - use feature's simplestyle properties
    polygonFillColor: ({ id }) => {
      if (!id) return colorToRgba(DEFAULT_FILL, DEFAULT_FILL_OPACITY);
      if (isFeatureHidden(td, id)) return TRANSPARENT;

      const ss = td.getSnapshotFeature(id);
      const fill = ss?.properties.fill;
      const fillOpacity = ss?.properties["fill-opacity"];

      if (fill && typeof fill === "string" && fill.startsWith("#")) {
        const opacity =
          typeof fillOpacity === "number" ? fillOpacity : DEFAULT_FILL_OPACITY;
        return colorToRgba(fill, opacity);
      }

      return colorToRgba(DEFAULT_FILL, DEFAULT_FILL_OPACITY);
    },
    polygonFillOpacity: 1,

    polygonOutlineColor: ({ id, properties }) => {
      if (!id) return colorToRgba(SELECTION_COLOR, 1);
      if (isFeatureHidden(td, id)) return TRANSPARENT;

      // If selected, use selection color
      if (properties.selected) {
        return colorToRgba(SELECTION_COLOR, 1);
      }

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

      return colorToRgba(DEFAULT_STROKE, DEFAULT_STROKE_OPACITY);
    },

    polygonOutlineWidth: ({ id, properties }) => {
      if (!id) return DEFAULT_STROKE_WIDTH;
      if (isFeatureHidden(td, id)) return 0;

      // If selected, use thicker width
      if (properties.selected) {
        return DEFAULT_STROKE_WIDTH + 2;
      }

      const ss = td.getSnapshotFeature(id);
      const strokeWidth = ss?.properties["stroke-width"];

      if (typeof strokeWidth === "number") {
        return strokeWidth;
      }

      return DEFAULT_STROKE_WIDTH;
    },

    // LineString styles - use feature's simplestyle properties
    lineStringColor: ({ id, properties }) => {
      if (!id) return colorToRgba(SELECTION_COLOR, 1);
      if (isFeatureHidden(td, id)) return TRANSPARENT;

      // If selected, use selection color
      if (properties.selected) {
        return colorToRgba(SELECTION_COLOR, 1);
      }

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

      return colorToRgba(DEFAULT_STROKE, DEFAULT_STROKE_OPACITY);
    },

    lineStringWidth: ({ id, properties }) => {
      if (!id) return DEFAULT_STROKE_WIDTH;
      if (isFeatureHidden(td, id)) return 0;

      // If selected, use thicker width
      if (properties.selected) {
        return DEFAULT_STROKE_WIDTH + 2;
      }

      const ss = td.getSnapshotFeature(id);
      const strokeWidth = ss?.properties["stroke-width"];

      if (typeof strokeWidth === "number") {
        return strokeWidth;
      }

      return DEFAULT_STROKE_WIDTH;
    },

    // Point styles
    pointColor: SELECTION_HANDLE_COLOR,
    pointOutlineColor: SELECTION_HANDLE_OUTLINE_COLOR,
    pointWidth: 6,
    pointOutlineWidth: 2,

    // Selection point (vertex handle) styles
    selectionPointColor: SELECTION_HANDLE_COLOR,
    selectionPointOutlineColor: SELECTION_HANDLE_OUTLINE_COLOR,
    selectionPointWidth: 8,
    selectionPointOutlineWidth: 2,

    // Midpoint styles
    midPointColor: MIDPOINT_COLOR,
    midPointOutlineColor: MIDPOINT_OUTLINE_COLOR,
    midPointWidth: 6,
    midPointOutlineWidth: 2,
  };
};
