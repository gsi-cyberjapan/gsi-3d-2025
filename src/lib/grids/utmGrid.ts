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
