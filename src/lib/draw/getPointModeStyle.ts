import { DRAW_CONFIG } from "@/lib/config";

export const DEFAULT_MARKER_SYMBOL = DRAW_CONFIG.MARKER.DEFAULT_ICON;
export const DEFAULT_MARKER_SIZE: MarkerSize = DRAW_CONFIG.MARKER.DEFAULT_SIZE;

const DEFAULT_POINT_WIDTH = 0;
const DEFAULT_POINT_COLOR = "#00000000";
const DEFAULT_POINT_OUTLINE_COLOR = "#00000000";
const DEFAULT_POINT_OUTLINE_WIDTH = 0;

type MarkerSize = keyof typeof DRAW_CONFIG.MARKER.SIZES;

export const getPointModeStyle = (): Partial<{
  pointColor: () => `#${string}`;
  pointWidth: () => number;
  pointOutlineColor: () => `#${string}`;
  pointOutlineWidth: () => number;
  editedPointColor: () => `#${string}`;
  editedPointWidth: () => number;
  editedPointOutlineColor: () => `#${string}`;
  editedPointOutlineWidth: () => number;
}> => {
  return {
    // ポイントモードでは点を透明にして非表示にする（React Markerで描画するため）
    pointColor: () => DEFAULT_POINT_COLOR,
    pointWidth: () => DEFAULT_POINT_WIDTH,
    pointOutlineColor: () => DEFAULT_POINT_OUTLINE_COLOR,
    pointOutlineWidth: () => DEFAULT_POINT_OUTLINE_WIDTH,
    // 編集中のポイントも透明にする
    editedPointColor: () => DEFAULT_POINT_COLOR,
    editedPointWidth: () => DEFAULT_POINT_WIDTH,
    editedPointOutlineColor: () => DEFAULT_POINT_OUTLINE_COLOR,
    editedPointOutlineWidth: () => DEFAULT_POINT_OUTLINE_WIDTH,
  };
};

/**
 * Get marker icon URL from symbol filename
 */
export const getMarkerIconUrl = (symbol: string): string => {
  return `${DRAW_CONFIG.MARKER.BASE_URL}${symbol}`;
};

/**
 * Get marker size in pixels
 */
export const getMarkerSizePixels = (size: MarkerSize): number => {
  return DRAW_CONFIG.MARKER.SIZES[size];
};
