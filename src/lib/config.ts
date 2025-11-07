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
  INITIAL_VIEW_STATE: {
    LONGITUDE: 140.097656,
    LATITUDE: 36.102376,
    ZOOM: 4,
  },
  /** マップを重ねた時の透過率の初期値 */
  INITIAL_OVERLAP_MAP_OPACITY: 0.5,
  /** 主マップのID */
  MAP_PRIMARY: { ID: "primary-map", NAME: "地図A" },
  /** サブマップのID */
  MAP_SECONDARY: { ID: "secondary-map", NAME: "地図B" },
} as const;
