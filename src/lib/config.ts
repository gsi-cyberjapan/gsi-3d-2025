export const GENERAL_CONFIG = {
  /** アプリケーションのタイトル */
  TITLE: "地理院地図",
  /** アプリケーションの説明 */
  DESCRIPTION: "",
  /** アプリケーションの言語 */
  LANGUAGE: "ja",
  /** ヘルプページのURL */
  HELP_PAGE_URL: "http://maps.gsi.go.jp/help",
} as const;

export const LAYOUT_CONFIG = {
  /** モバイルと判定するブレイクポイント */
  MOBILE_BREAKPOINT_PX: 768,
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
    // TODO: https://github.com/gsi-cyberjapan/3dpc-3dtiles からさらに追加
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
      ID: "skeleton-vector",
      TITLE: "白地図",
      LEGEND_IMAGE_URL:
        "http://raw.githubusercontent.com/gsi-cyberjapan/3dpc-3dtiles/refs/heads/main/public/images/skeleton.png",
      STYLE_URL:
        "https://raw.githubusercontent.com/gsi-cyberjapan/3dpc-3dtiles/refs/heads/main/public/styles/skeleton.json",
      MIN_ZOOM: 4,
      MAX_ZOOM: 16,
    },
    {
      ID: "std-english-vector",
      TITLE: "English",
      LEGEND_IMAGE_URL:
        "http://raw.githubusercontent.com/gsi-cyberjapan/3dpc-3dtiles/refs/heads/main/public/images/std-english.png",
      STYLE_URL:
        "https://raw.githubusercontent.com/gsi-cyberjapan/3dpc-3dtiles/refs/heads/main/public/styles/std-english.json",
      MIN_ZOOM: 4,
      MAX_ZOOM: 16,
    },
    {
      ID: "seamlessphoto-vector",
      TITLE: "写真",
      LEGEND_IMAGE_URL:
        "http://raw.githubusercontent.com/gsi-cyberjapan/3dpc-3dtiles/refs/heads/main/public/images/seamlessphoto.png",
      STYLE_URL:
        "https://raw.githubusercontent.com/gsi-cyberjapan/3dpc-3dtiles/refs/heads/main/public/styles/seamlessphoto.json",
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
    // TODO: https://github.com/gsi-cyberjapan/gsimaps からさらに追加
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
      MAX_ZOOM: 14,
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
      MAX_ZOOM: 11,
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

  /** Globeのベースレイヤー */
  GLOBE_LAYERS: [
    {
      ID: "std-globe",
      TITLE: "標準地図",
      LEGEND_IMAGE_URL:
        "https://cyberjapandata.gsi.go.jp/xyz/std/18/232801/103215.png",
      TILE_URL: "https://maps.gsi.go.jp/xyz/std/{z}/{x}/{y}.png?_=20191214c",
      ERROR_TILE_URL:
        "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps/refs/heads/gh-pages/image/map/no-data-std.png",
      MAX_ZOOM: 18,
    },
    // TODO: https://github.com/gsi-cyberjapan/gsimaps-globe からさらに追加（不明なものはRasterから補完）
    {
      ID: "pale-globe",
      TITLE: "淡色地図",
      LEGEND_IMAGE_URL:
        "https://cyberjapandata.gsi.go.jp/xyz/pale/18/232801/103215.png",
      TILE_URL: "https://maps.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png?_=20191214c",
      ERROR_TILE_URL:
        "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps/refs/heads/gh-pages/image/map/no-data-pale.png",
      MAX_ZOOM: 18,
    },
    {
      ID: "blank-globe",
      TITLE: "白地図",
      LEGEND_IMAGE_URL: "https://maps.gsi.go.jp/xyz/blank/14/14550/6447.png",
      TILE_URL: "https://maps.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png?_=20191214c",
      ERROR_TILE_URL:
        "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps/refs/heads/gh-pages/image/map/no-data-blank.png",
      MAX_ZOOM: 18,
    },
    {
      ID: "english-globe",
      TITLE: "English",
      LEGEND_IMAGE_URL: "https://maps.gsi.go.jp/xyz/english/11/1815/806.png",
      TILE_URL:
        "https://maps.gsi.go.jp/xyz/english/{z}/{x}/{y}.png?_=20191214c",
      ERROR_TILE_URL:
        "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps/refs/heads/gh-pages/image/map/no-data-english.png",
      MAX_ZOOM: 18,
    },
    {
      ID: "photo-globe",
      TITLE: "写真",
      LEGEND_IMAGE_URL:
        "https://maps.gsi.go.jp/xyz/seamlessphoto/18/232801/103215.jpg",
      TILE_URL: "https://maps.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
      ERROR_TILE_URL:
        "https://raw.githubusercontent.com/gsi-cyberjapan/gsimaps/refs/heads/gh-pages/image/map/no-data-ort.png",
      MAX_ZOOM: 18,
    },
  ],
} as const;
