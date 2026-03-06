import * as mgrs from "mgrs";
import proj4 from "proj4";

/**
 * UTMグリッドの間隔をメートル単位で返す
 */
export const getUtmGridIntervalMeters = (zoom: number): number => {
  if (zoom <= 7) return 0; // ゾーン表示のみ
  if (zoom <= 10) return 100000; // 100km
  if (zoom === 11) return 20000; // 20km
  if (zoom === 12) return 10000; // 10km
  if (zoom === 13) return 5000; // 5km
  if (zoom === 14) return 3000; // 3km
  if (zoom === 15) return 1000; // 1km
  if (zoom === 16) return 500; // 500m
  if (zoom === 17) return 250; // 250m
  return 100; // 100m
};

/**
 * 経度からUTMゾーン番号を計算
 */
export const lngToUtmZone = (lng: number): number => {
  return Math.floor(lng / 6) + 31;
};

/**
 * UTMゾーンの中央経線を返す
 */
export const utmZoneCentralMeridian = (zone: number): number => {
  return (zone - 1) * 6 - 180 + 3;
};

/**
 * UTMゾーンの緯度帯を返す
 */
export const getUtmLatBand = (lat: number): string => {
  const bands = "CDEFGHJKLMNPQRSTUVWX";
  const index = Math.floor((lat + 80) / 8);
  return bands[Math.min(index, bands.length - 1)] ?? "X";
};

/**
 * WGS84座標をUTM座標に変換
 */
export const latLngToUtm = (
  lng: number,
  lat: number,
  zone: number,
): { easting: number; northing: number; southern: boolean } => {
  const southern = lat < 0;
  const projString = `+proj=utm +zone=${String(zone)}${southern ? " +south" : ""} +datum=WGS84 +units=m +no_defs`;
  const [easting, northing] = proj4("EPSG:4326", projString, [lng, lat]);
  return { easting, northing, southern };
};

/**
 * UTM座標をWGS84座標に変換
 */
export const utmToLatLng = (
  easting: number,
  northing: number,
  zone: number,
  southern: boolean,
): { lng: number; lat: number } => {
  const projString = `+proj=utm +zone=${String(zone)}${southern ? " +south" : ""} +datum=WGS84 +units=m +no_defs`;
  const [lng, lat] = proj4(projString, "EPSG:4326", [easting, northing]);
  return { lng, lat };
};

/**
 * MGRSラベルを生成
 */
export const getUtmGridLabel = (
  lng: number,
  lat: number,
  intervalMeters: number,
): string | null => {
  if (lat < -80 || lat > 84) return null;
  if (intervalMeters === 100000) {
    // 100kmグリッド: "54SUE" 形式（ゾーン番号 + バンド + 100km識別子）
    const full = mgrs.forward([lng, lat], 1);
    return full.slice(0, 5);
  }
  // サブグリッド: "54SUE81454924" 形式（精度4 = 10m）
  return mgrs.forward([lng, lat], 4);
};

/**
 * ライン曲率用の中間点間隔を返す
 * 100km/20kmグリッドはUTM直線がWGS84上で曲がるため10km刻み
 */
export const getIntermediateStepMeters = (intervalMeters: number): number => {
  if (intervalMeters >= 20000) return 10000;
  return intervalMeters;
};
