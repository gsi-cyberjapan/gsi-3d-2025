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

export const getCircleModeStyle = (
  td: TerraDraw,
): Partial<{
  fillColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  fillOpacity: 1;
  outlineColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  outlineWidth: (feature: GeoJSONStoreFeatures) => number;
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
  };
};
