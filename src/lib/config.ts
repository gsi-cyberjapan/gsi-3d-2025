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
    LONGITUDE: 139.767066,
    LATITUDE: 35.6813,
    ZOOM: 9,
  },
  /** マップを重ねた時の透過率の初期値 */
  INITIAL_OVERLAP_MAP_OPACITY: 0.5,
  /** 主マップのID */
  MAP_PRIMARY: { ID: "primary-map", NAME: "地図A" },
  /** サブマップのID */
  MAP_SECONDARY: { ID: "secondary-map", NAME: "地図B" },
} as const;

export const BASE_LAYER_CONFIG = {
  /** ラスターの定義ファイルURL */
  RASTER_DEFINITION_URL:
    "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps/refs/heads/gh-pages/layers_txt/layers0.txt",
  /** グローブの定義ファイルURL */
  GLOBE_DEFINITION_URL:
    "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps-globe/refs/heads/gh-pages/layers_txt/layers0.txt",
  /** ベクターの定義リスト */
  VECTOR_STYLES: [
    {
      TITLE: "標準地図",
      URL: "https://raw.githubusercontent.com/gsi-cyberjapan/gsivectortile-mapbox-gl-js/refs/heads/master/std.json",
    },
    {
      TITLE: "淡色地図",
      URL: "https://raw.githubusercontent.com/gsi-cyberjapan/gsivectortile-mapbox-gl-js/refs/heads/master/pale.json",
    },
    {
      TITLE: "白地図",
      URL: "https://raw.githubusercontent.com/gsi-cyberjapan/gsivectortile-mapbox-gl-js/refs/heads/master/blank.json",
    },
  ],
  /** ベクターのレジェンド画像が格納されているURL */
  VECTOR_LEGEND_IMAGE_PATH:
    "https://github.com/gsi-cyberjapan/gsimaps-vector-experiment/blob/master/image/thumb",
};
