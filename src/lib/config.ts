export const GENERAL_CONFIG = {
  /** アプリケーションのタイトル */
  TITLE: "地理院地図",
  /** アプリケーションの説明 */
  DESCRIPTION: "",
  /** アプリケーションの言語 */
  LANGUAGE: "ja",
} as const;

export const RESPONSIVE_CONFIG = {
  /** モバイルと判定するブレイクポイント */
  MOBILE_BREAKPOINT_PX: 768,
} as const;

export const MAP_CONFIG = {
  /** 初期表示状態 */
  INITALI_VIEW_STATE: {
    LONGITUDE: -100,
    LATITUDE: 40,
    ZOOM: 3.5,
  },
  /** 主マップのID */
  MAP_A: { ID: "map-a", NAME: "地図A" },
  /** サブマップのID */
  MAP_B: { ID: "map-b", NAME: "地図B" },
} as const;
