import { TerraDraw, GeoJSONStoreFeatures } from "terra-draw";

export const DEFAULT_TEXT_COLOR = "#000000";
export const DEFAULT_TEXT_SIZE = 16;
export const DEFAULT_TEXT_BOLD = false;
export const DEFAULT_TEXT_ITALIC = false;
export const DEFAULT_TEXT_UNDERLINE = false;
export const DEFAULT_IS_HTML = false;
export const DEFAULT_TEXT_CONTENT = "";

const DEFAULT_POINT_WIDTH = 0;
const DEFAULT_POINT_COLOR = "#00000000";
const DEFAULT_POINT_OUTLINE_COLOR = "#00000000";
const DEFAULT_POINT_OUTLINE_WIDTH = 0;

export const getTextModeStyle = (
  td: TerraDraw,
): Partial<{
  pointColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  pointWidth: (feature: GeoJSONStoreFeatures) => number;
  pointOutlineColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  pointOutlineWidth: (feature: GeoJSONStoreFeatures) => number;
}> => {
  return {
    pointColor: ({ id }) => {
      if (!id) return DEFAULT_POINT_COLOR;
      const ss = td.getSnapshotFeature(id);

      if (!ss?.properties.textContent) {
        td.updateFeatureProperties(id, {
          textContent: DEFAULT_TEXT_CONTENT,
          textColor: DEFAULT_TEXT_COLOR,
          textSize: DEFAULT_TEXT_SIZE,
          textBold: DEFAULT_TEXT_BOLD,
          textItalic: DEFAULT_TEXT_ITALIC,
          textUnderline: DEFAULT_TEXT_UNDERLINE,
          isHtml: DEFAULT_IS_HTML,
        });
      }

      return DEFAULT_POINT_COLOR;
    },
    pointWidth: () => DEFAULT_POINT_WIDTH,
    pointOutlineColor: () => DEFAULT_POINT_OUTLINE_COLOR,
    pointOutlineWidth: () => DEFAULT_POINT_OUTLINE_WIDTH,
  };
};
