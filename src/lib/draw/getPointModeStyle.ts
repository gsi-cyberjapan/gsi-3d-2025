import { MARKER_ICON_CONFIG, MarkerSize } from "@/lib/config";

export const DEFAULT_MARKER_SYMBOL = MARKER_ICON_CONFIG.DEFAULT_ICON;
export const DEFAULT_MARKER_SIZE: MarkerSize = MARKER_ICON_CONFIG.DEFAULT_SIZE;

const DEFAULT_POINT_WIDTH = 0;
const DEFAULT_POINT_COLOR = "#00000000";
const DEFAULT_POINT_OUTLINE_COLOR = "#00000000";
const DEFAULT_POINT_OUTLINE_WIDTH = 0;

export const getPointModeStyle = (): Partial<{
  pointColor: () => `#${string}`;
  pointWidth: () => number;
  pointOutlineColor: () => `#${string}`;
  pointOutlineWidth: () => number;
}> => {
  return {
    // ポイントモードでは点を透明にして非表示にする（React Markerで描画するため）
    pointColor: () => DEFAULT_POINT_COLOR,
    pointWidth: () => DEFAULT_POINT_WIDTH,
    pointOutlineColor: () => DEFAULT_POINT_OUTLINE_COLOR,
    pointOutlineWidth: () => DEFAULT_POINT_OUTLINE_WIDTH,
  };
};

/**
 * Get marker icon URL from symbol filename
 */
export const getMarkerIconUrl = (symbol: string): string => {
  return `${MARKER_ICON_CONFIG.BASE_URL}${symbol}`;
};

/**
 * Get marker size in pixels
 */
export const getMarkerSizePixels = (size: MarkerSize): number => {
  return MARKER_ICON_CONFIG.SIZES[size];
};
