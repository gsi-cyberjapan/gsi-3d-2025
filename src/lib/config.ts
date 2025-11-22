export const GENERAL_CONFIG = {
  /** アプリケーションのタイトル */
  TITLE: "地理院地図",
  /** アプリケーションの説明 */
  DESCRIPTION: "",
  /** アプリケーションの言語 */
  LANGUAGE: "ja",
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
    },
    // TODO: https://github.com/gsi-cyberjapan/3dpc-3dtiles からさらに追加
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
    },
    // TODO: https://github.com/gsi-cyberjapan/gsimaps からさらに追加
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
    },
    // TODO: https://github.com/gsi-cyberjapan/gsimaps-globe からさらに追加（不明なものはRasterから補完）
  ],
} as const;
