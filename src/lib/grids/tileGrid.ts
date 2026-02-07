/**
 * 緯度をSlippy map tileのY座標に変換
 */
export const latToTileY = (lat: number, zoom: number): number => {
  const n = Math.pow(2, zoom);
  const latRad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  );
};

/**
 * 経度をSlippy map tileのX座標に変換
 */
export const lngToTileX = (lng: number, zoom: number): number => {
  const n = Math.pow(2, zoom);
  return Math.floor(((lng + 180) / 360) * n);
};

/**
 * タイルY座標を緯度に変換
 */
export const tileYToLat = (y: number, zoom: number): number => {
  const n = Math.pow(2, zoom);
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
  return (latRad * 180) / Math.PI;
};

/**
 * タイルX座標を経度に変換
 */
export const tileXToLng = (x: number, zoom: number): number => {
  const n = Math.pow(2, zoom);
  return (x / n) * 360 - 180;
};
