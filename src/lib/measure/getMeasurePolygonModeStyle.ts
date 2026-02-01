import type { GeoJSONStoreFeatures } from "terra-draw";

const MEASURE_FILL_COLOR = "#0011FF20" as const;
const MEASURE_OUTLINE_COLOR = "#0011FFFF" as const;
const MEASURE_OUTLINE_WIDTH = 3;
const MEASURE_POINT_COLOR = "#FFFFFFFF" as const;
const MEASURE_POINT_OUTLINE_COLOR = "#0011FFFF" as const;

export const getMeasurePolygonModeStyle = (): Partial<{
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
    fillColor: () => MEASURE_FILL_COLOR,
    fillOpacity: 1,
    outlineColor: () => MEASURE_OUTLINE_COLOR,
    outlineWidth: () => MEASURE_OUTLINE_WIDTH,
    closingPointColor: MEASURE_POINT_COLOR,
    closingPointOutlineColor: MEASURE_POINT_OUTLINE_COLOR,
    snappingPointColor: MEASURE_POINT_COLOR,
    snappingPointOutlineColor: MEASURE_POINT_OUTLINE_COLOR,
  };
};
