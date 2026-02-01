import type { GeoJSONStoreFeatures } from "terra-draw";

const MEASURE_LINE_COLOR = "#0011FF" as const;
const MEASURE_LINE_WIDTH = 3;
const MEASURE_POINT_COLOR = "#FFFFFFFF" as const;
const MEASURE_POINT_OUTLINE_COLOR = "#0011FFFF" as const;

export const getMeasureLineStringModeStyle = (): Partial<{
  lineStringColor: (feature: GeoJSONStoreFeatures) => `#${string}`;
  lineStringWidth: (feature: GeoJSONStoreFeatures) => number;
  snappingPointColor: `#${string}`;
  snappingPointOutlineColor: `#${string}`;
  closingPointColor: `#${string}`;
  closingPointOutlineColor: `#${string}`;
}> => {
  return {
    lineStringColor: () => `${MEASURE_LINE_COLOR}FF`,
    lineStringWidth: () => MEASURE_LINE_WIDTH,
    closingPointColor: MEASURE_POINT_COLOR,
    closingPointOutlineColor: MEASURE_POINT_OUTLINE_COLOR,
    snappingPointColor: MEASURE_POINT_COLOR,
    snappingPointOutlineColor: MEASURE_POINT_OUTLINE_COLOR,
  };
};
