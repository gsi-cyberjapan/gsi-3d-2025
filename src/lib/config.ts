export const GENERAL_CONFIG = {
  /** アプリケーションのタイトル */
  TITLE: "3次元地図可視化サイト",
  /** アプリケーションの説明 */
  DESCRIPTION: "",
  /** アプリケーションの言語 */
  LANGUAGE: "ja",
  /** ヘルプページのURL */
  HELP_PAGE_URL: "http://maps.gsi.go.jp/help/",
} as const;

export const LAYOUT_CONFIG = {
  /** モバイルと判定するブレイクポイント */
  MOBILE_BREAKPOINT_PX: 768,
} as const;

export const ZOOM_CONFIG = {
  /** Raster/Vectorマップの最小・最大ズームレベル（UI制御） */
  RASTER_VECTOR_MIN_ZOOM: 4,
  RASTER_VECTOR_MAX_ZOOM: 20,
  /** Globeマップの最小・最大ズームレベル（UI制御） */
  GLOBE_MIN_ZOOM: 2,
  GLOBE_MAX_ZOOM: 20,
} as const;

export const BASE_LAYER_CONFIG = {
  /** Vectorのベースレイヤー */
  VECTOR_LAYERS: [
    {
      ID: "std-vector",
      TITLE: "標準地図",
      LEGEND_IMAGE_URL:
        "http://raw.githubusercontent.com/gsi-cyberjapan/3dpc-3dtiles/refs/heads/main/public/images/std.png",
      STYLE_URL:
        "https://raw.githubusercontent.com/gsi-cyberjapan/3dpc-3dtiles/refs/heads/main/public/styles/std.json",
      MIN_ZOOM: 4,
      MAX_ZOOM: 16,
    },
    {
      ID: "pale-vector",
      TITLE: "淡色地図",
      LEGEND_IMAGE_URL:
        "http://raw.githubusercontent.com/gsi-cyberjapan/3dpc-3dtiles/refs/heads/main/public/images/pale.png",
      STYLE_URL:
        "https://raw.githubusercontent.com/gsi-cyberjapan/3dpc-3dtiles/refs/heads/main/public/styles/pale.json",
      MIN_ZOOM: 4,
      MAX_ZOOM: 16,
    },
    {
      ID: "blank-vector",
      TITLE: "白地図",
      LEGEND_IMAGE_URL:
        "http://raw.githubusercontent.com/gsi-cyberjapan/3dpc-3dtiles/refs/heads/main/public/images/skeleton.png",
      STYLE_URL:
        "https://raw.githubusercontent.com/gsi-cyberjapan/3dpc-3dtiles/refs/heads/main/public/styles/skeleton.json",
      MIN_ZOOM: 4,
      MAX_ZOOM: 16,
    },
    {
      ID: "english-vector",
      TITLE: "English",
      LEGEND_IMAGE_URL:
        "http://raw.githubusercontent.com/gsi-cyberjapan/3dpc-3dtiles/refs/heads/main/public/images/std-english.png",
      STYLE_URL:
        "https://raw.githubusercontent.com/gsi-cyberjapan/3dpc-3dtiles/refs/heads/main/public/styles/std-english.json",
      MIN_ZOOM: 4,
      MAX_ZOOM: 16,
    },
  ],

  /** Rasterのベースレイヤー */
  RASTER_LAYERS: [
    {
      ID: "std-raster",
      TITLE: "標準地図",
      LEGEND_IMAGE_URL:
        "https://cyberjapandata.gsi.go.jp/xyz/std/18/232801/103215.png",
      TILE_URL: "https://maps.gsi.go.jp/xyz/std/{z}/{x}/{y}.png?_=20210915a",
      ERROR_TILE_URL:
        "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps/refs/heads/gh-pages/image/map/no-data-std.png",
      MIN_ZOOM: 4,
      MAX_ZOOM: 17,
    },
    {
      ID: "pale-raster",
      TITLE: "淡色地図",
      LEGEND_IMAGE_URL:
        "https://cyberjapandata.gsi.go.jp/xyz/pale/18/232801/103215.png",
      TILE_URL: "https://maps.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png?_=20210915a",
      ERROR_TILE_URL:
        "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps/refs/heads/gh-pages/image/map/no-data-pale.png",
      MIN_ZOOM: 4,
      MAX_ZOOM: 17,
    },
    {
      ID: "blank-raster",
      TITLE: "白地図",
      LEGEND_IMAGE_URL: "https://maps.gsi.go.jp/xyz/blank/14/14550/6447.png",
      TILE_URL: "https://maps.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png?_=20210915a",
      ERROR_TILE_URL:
        "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps/refs/heads/gh-pages/image/map/no-data-blank.png",
      MIN_ZOOM: 4,
      MAX_ZOOM: 17,
    },
    {
      ID: "english-raster",
      TITLE: "English",
      LEGEND_IMAGE_URL: "https://maps.gsi.go.jp/xyz/english/11/1815/806.png",
      TILE_URL:
        "https://maps.gsi.go.jp/xyz/english/{z}/{x}/{y}.png?_=20210915a",
      ERROR_TILE_URL:
        "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps/refs/heads/gh-pages/image/map/no-data-english.png",
      MIN_ZOOM: 4,
      MAX_ZOOM: 17,
    },
    {
      ID: "photo-raster",
      TITLE: "写真",
      LEGEND_IMAGE_URL:
        "https://maps.gsi.go.jp/xyz/seamlessphoto/18/232801/103215.jpg",
      TILE_URL: "https://maps.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
      ERROR_TILE_URL:
        "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps/refs/heads/gh-pages/image/map/no-data-ort.png",
      MIN_ZOOM: 4,
      MAX_ZOOM: 17,
    },
  ],
} as const;

export const OPTIONAL_LAYER_CONFIG = {
  /** レイヤー一覧が存在するルートURL */
  BASE_LAYER_URL:
    "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps/refs/heads/gh-pages/layers_txt",
  /** 画像が存在するルートURL */
  BASE_IMAGE_URL:
    "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps/refs/heads/gh-pages",
  /** レイヤー一覧の定義ファイル */
  LAYERS_DEFINITION_FILE_PATH: "/layers.txt",
} as const;

export const GEOCODING_CONFIG = {
  /** GSI MUNI master data URL */
  MUNI_DATA_URL: "https://maps.gsi.go.jp/js/muni.js",
  /** GSI Address Search API URL */
  ADDRESS_SEARCH_URL: "https://msearch.gsi.go.jp/address-search/AddressSearch",
  /** GSI Reverse Geocoder URL */
  REVERSE_GEOCODE_URL:
    "https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress",
} as const;
