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
export const SELECTION_COLOR = "#FF6600";

/**
 * Check if a feature is in point or text mode
 */
const isPointOrTextMode = (
  td: TerraDraw,
  id: string | number | undefined,
): boolean => {
  if (!id) return false;
  const feature = td.getSnapshotFeature(id);
  const mode = feature?.properties.mode;
  return mode === "point" || mode === "text";
};

/**
 * Check if a selection point belongs to a point/text mode feature
 */
const isSelectionPointForPointOrText = (
  td: TerraDraw,
  properties: GeoJSONStoreFeatures["properties"],
): boolean => {
  const featureId = properties.selectionPointFeatureId;
  if (typeof featureId !== "string" && typeof featureId !== "number") {
    return false;
  }
  return isPointOrTextMode(td, featureId);
};
const SELECTION_FILL_OPACITY = 0.3;
const SELECTION_HANDLE_COLOR = "#FF6600FF"; // オレンジに統一
const SELECTION_HANDLE_OUTLINE_COLOR = "#FF6600FF";
const MIDPOINT_COLOR = "#FFFFFFCC";
const MIDPOINT_OUTLINE_COLOR = "#FF6600FF";

export const getSelectModeStyle = (
  td: TerraDraw,
): Partial<{
  // Non-selected polygon styles
  polygonFillColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  polygonFillOpacity: 1;
  polygonOutlineColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  polygonOutlineWidth: (feature: GeoJSONStoreFeatures) => number;
  // Selected polygon styles
  selectedPolygonColor: `#${string}`;
  selectedPolygonOutlineColor: `#${string}`;
  selectedPolygonOutlineWidth: number;
  selectedPolygonFillOpacity: number;
  // Non-selected LineString styles
  lineStringColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  lineStringWidth: (feature: GeoJSONStoreFeatures) => number;
  // Selected LineString styles
  selectedLineStringColor: `#${string}`;
  selectedLineStringWidth: number;
  // Non-selected point styles
  pointColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  pointOutlineColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  pointWidth: (feature: GeoJSONStoreFeatures) => number;
  pointOutlineWidth: (feature: GeoJSONStoreFeatures) => number;
  // Selected point styles
  selectedPointColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  selectedPointOutlineColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  selectedPointWidth: (feature: GeoJSONStoreFeatures) => number;
  selectedPointOutlineWidth: (feature: GeoJSONStoreFeatures) => number;
  // Selection point (vertex handle) styles
  selectionPointColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  selectionPointOutlineColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  selectionPointWidth: (feature: GeoJSONStoreFeatures) => number;
  selectionPointOutlineWidth: (feature: GeoJSONStoreFeatures) => number;
  // Midpoint styles
  midPointColor: `#${string}`;
  midPointOutlineColor: `#${string}`;
  midPointWidth: number;
  midPointOutlineWidth: number;
  // Selected marker styles (for hiding default TerraDraw markers)
  selectedMarkerUrl: (feature: GeoJSONStoreFeatures) => string;
  selectedMarkerHeight: (feature: GeoJSONStoreFeatures) => number;
  selectedMarkerWidth: (feature: GeoJSONStoreFeatures) => number;
}> => {
  return {
    // Non-selected polygon styles - use feature's simplestyle properties
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

    polygonOutlineColor: ({ id }) => {
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

      return colorToRgba(DEFAULT_STROKE, DEFAULT_STROKE_OPACITY);
    },

    polygonOutlineWidth: ({ id }) => {
      if (!id) return DEFAULT_STROKE_WIDTH;
      if (isFeatureHidden(td, id)) return 0;

      const ss = td.getSnapshotFeature(id);
      const strokeWidth = ss?.properties["stroke-width"];

      if (typeof strokeWidth === "number") {
        return strokeWidth;
      }

      return DEFAULT_STROKE_WIDTH;
    },

    // Selected polygon styles (orange)
    selectedPolygonColor: SELECTION_COLOR as `#${string}`,
    selectedPolygonOutlineColor: SELECTION_COLOR as `#${string}`,
    selectedPolygonOutlineWidth: DEFAULT_STROKE_WIDTH + 2,
    selectedPolygonFillOpacity: SELECTION_FILL_OPACITY,

    // Non-selected LineString styles - use feature's simplestyle properties
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

      return DEFAULT_STROKE_WIDTH;
    },

    // Selected LineString styles (orange)
    selectedLineStringColor: SELECTION_COLOR as `#${string}`,
    selectedLineStringWidth: DEFAULT_STROKE_WIDTH + 2,

    // Non-selected point styles
    // For point/text mode features, use transparent styles (React Marker handles rendering)
    pointColor: ({ id }) => {
      if (!id) return SELECTION_HANDLE_COLOR;
      return isPointOrTextMode(td, id) ? TRANSPARENT : SELECTION_HANDLE_COLOR;
    },
    pointOutlineColor: ({ id }) => {
      if (!id) return SELECTION_HANDLE_OUTLINE_COLOR;
      return isPointOrTextMode(td, id)
        ? TRANSPARENT
        : SELECTION_HANDLE_OUTLINE_COLOR;
    },
    pointWidth: ({ id }) => {
      if (!id) return 6;
      return isPointOrTextMode(td, id) ? 0 : 6;
    },
    pointOutlineWidth: ({ id }) => {
      if (!id) return 2;
      return isPointOrTextMode(td, id) ? 0 : 2;
    },

    // Selected point styles (orange)
    // For point/text mode features, use transparent styles (React Marker handles rendering)
    selectedPointColor: ({ id }) => {
      if (!id) return SELECTION_COLOR as `#${string}`;
      return isPointOrTextMode(td, id)
        ? TRANSPARENT
        : (SELECTION_COLOR as `#${string}`);
    },
    selectedPointOutlineColor: ({ id }) => {
      if (!id) return SELECTION_HANDLE_OUTLINE_COLOR;
      return isPointOrTextMode(td, id)
        ? TRANSPARENT
        : SELECTION_HANDLE_OUTLINE_COLOR;
    },
    selectedPointWidth: ({ id }) => {
      if (!id) return 8;
      return isPointOrTextMode(td, id) ? 0 : 8;
    },
    selectedPointOutlineWidth: ({ id }) => {
      if (!id) return 2;
      return isPointOrTextMode(td, id) ? 0 : 2;
    },

    // Selection point (vertex handle) styles
    // For point/text mode features, hide selection handles (React Marker handles rendering)
    selectionPointColor: ({ properties }) =>
      isSelectionPointForPointOrText(td, properties)
        ? TRANSPARENT
        : SELECTION_HANDLE_COLOR,
    selectionPointOutlineColor: ({ properties }) =>
      isSelectionPointForPointOrText(td, properties)
        ? TRANSPARENT
        : SELECTION_HANDLE_OUTLINE_COLOR,
    selectionPointWidth: ({ properties }) =>
      isSelectionPointForPointOrText(td, properties) ? 0 : 8,
    selectionPointOutlineWidth: ({ properties }) =>
      isSelectionPointForPointOrText(td, properties) ? 0 : 2,

    // Midpoint styles
    midPointColor: MIDPOINT_COLOR,
    midPointOutlineColor: MIDPOINT_OUTLINE_COLOR,
    midPointWidth: 6,
    midPointOutlineWidth: 2,

    // Selected marker styles
    // Hide default TerraDraw markers (React Marker handles rendering for point/text features)
    selectedMarkerUrl: () => "",
    selectedMarkerHeight: () => 0,
    selectedMarkerWidth: () => 0,
  };
};
