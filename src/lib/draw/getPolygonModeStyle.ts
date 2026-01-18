import { TerraDraw, GeoJSONStoreFeatures } from "terra-draw";
import { colorToRgba } from "@/lib/colorConverter";
import { useStore } from "@/hooks/store/useStore";

const TRANSPARENT = "#00000000" as const;
const DEFAULT_SOURCE = "terradraw";

/**
 * Check if a feature should be hidden based on hiddenSources
 */
export const isFeatureHidden = (
  td: TerraDraw,
  id: string | number,
): boolean => {
  const ss = td.getSnapshotFeature(id);
  if (!ss) return false;

  const rawMapId = ss.properties.mapId;
  const mapId = typeof rawMapId === "string" ? rawMapId : "";
  const source =
    typeof ss.properties.source === "string"
      ? ss.properties.source
      : DEFAULT_SOURCE;
  const sourceKey = `${mapId}:${source}`;

  const hiddenSources = useStore.getState().hiddenSources;
  return hiddenSources.has(sourceKey);
};

// Default simplestyle values
export const DEFAULT_FILL = "#0011FF";
export const DEFAULT_FILL_OPACITY = 0.0625;
export const DEFAULT_STROKE = "#0011FF";
export const DEFAULT_STROKE_OPACITY = 1;
export const DEFAULT_STROKE_WIDTH = 2;

// Vertex style values (matching LineString mode)
const DEFAULT_CLOSING_POINT_COLOR = "#FFFFFFFF";
const DEFAULT_SNAPPING_POINT_COLOR = "#FFFFFFFF";
const DEFAULT_CLOSING_POINT_OUTLINE_COLOR = "#0011FFFF";
const DEFAULT_SNAPPING_POINT_OUTLINE_COLOR = "#0011FFFF";

export const getPolygonModeStyle = (
  td: TerraDraw,
): Partial<{
  fillColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  fillOpacity: 1;
  outlineColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  outlineWidth: (feature: GeoJSONStoreFeatures) => number;
  closingPointColor: `#${string}`;
  closingPointOutlineColor: `#${string}`;
  snappingPointColor: `#${string}`;
  snappingPointOutlineColor: `#${string}`;
}> => {
  return {
    fillColor: ({ id }) => {
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

      td.updateFeatureProperties(id, {
        fill: DEFAULT_FILL,
        "fill-opacity": DEFAULT_FILL_OPACITY,
      });
      return colorToRgba(DEFAULT_FILL, DEFAULT_FILL_OPACITY);
    },
    fillOpacity: 1,

    outlineColor: ({ id }) => {
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

    outlineWidth: ({ id }) => {
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
