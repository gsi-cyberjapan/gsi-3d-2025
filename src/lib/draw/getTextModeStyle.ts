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

export const getTextModeStyle = (): Partial<{
  pointColor: () => `#${string}`;
  pointWidth: () => number;
  pointOutlineColor: () => `#${string}`;
  pointOutlineWidth: () => number;
}> => {
  return {
    // テキストモードでは点を透明にして非表示にする
    pointColor: () => DEFAULT_POINT_COLOR,
    pointWidth: () => DEFAULT_POINT_WIDTH,
    pointOutlineColor: () => DEFAULT_POINT_OUTLINE_COLOR,
    pointOutlineWidth: () => DEFAULT_POINT_OUTLINE_WIDTH,
  };
};
