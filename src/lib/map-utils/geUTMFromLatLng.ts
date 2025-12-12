import * as mgrs from "mgrs";

/**
 * 緯度経度から MGRS (例: 54TXP00135435) を生成
 * @param lat 緯度 (WGS84, degrees)
 * @param lng 経度 (WGS84, degrees)
 * @param precision 1〜5 (1: 10km, 5: 1m)
 * @returns MGRS 文字列、または極域（80°S未満、84°N超過）の場合は null
 */
export function getUTMFromLatLng(
  lat: number,
  lng: number,
  precision: 1 | 2 | 3 | 4 | 5 = 5,
): string | null {
  // MGRS は極域（80°S未満、84°N超過）をサポートしていない
  if (lat < -80 || lat > 84) {
    return null;
  }

  return mgrs.forward([lng, lat], precision);
}
