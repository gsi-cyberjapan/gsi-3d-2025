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

export const BASE_LAYER_CONFIG = {
  /** ラスターの定義ファイルURL */
  RUSTER_DEFINITION_URL:
    "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps/refs/heads/gh-pages/layers_txt/layers0.txt",
  /** ベクターのデータURL */
  VECTOR_DATA_URL:
    "https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap/{z}/{x}/{y}.pbf",
  /** ベクターのスタイルURLリスト */
  VECTOR_STYLE_URLS: [
    "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps-vector-experiment/refs/heads/master/data/std.json",
    "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps-vector-experiment/refs/heads/master/data/pale.json",
    "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps-vector-experiment/refs/heads/master/data/blank.json",
    "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps-vector-experiment/refs/heads/master/data/label.json",
    "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps-vector-experiment/refs/heads/master/data/llabel.json",
    "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps-vector-experiment/refs/heads/master/data/std2.json",
    "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps-vector-experiment/refs/heads/master/data/pale2.json",
    "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps-vector-experiment/refs/heads/master/data/blank2.json",
  ],
  /** ベクターのレジェンド画像が格納されているURL */
  VECTOR_LEGEND_IMAGE_PATH:
    "https://github.com/gsi-cyberjapan/gsimaps-vector-experiment/blob/master/image/thumb",
};
