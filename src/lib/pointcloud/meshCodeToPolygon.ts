/**
 * 3次メッシュコードから地理座標バウンディングボックスへの変換
 * 3次メッシュの1セルサイズ: 緯度 30秒, 経度 45秒
 */

/** [west, south, east, north] */
export type Bounds = [number, number, number, number];

/**
 * 8桁の3次メッシュコードからバウンディングボックスを計算
 */
export const meshCodeToBounds = (code: string): Bounds => {
  // 1次メッシュ (4桁)
  const lat1 = parseInt(code.substring(0, 2), 10);
  const lng1 = parseInt(code.substring(2, 4), 10);

  // 2次メッシュ (2桁)
  const lat2 = parseInt(code.substring(4, 5), 10);
  const lng2 = parseInt(code.substring(5, 6), 10);

  // 3次メッシュ (2桁)
  const lat3 = parseInt(code.substring(6, 7), 10);
  const lng3 = parseInt(code.substring(7, 8), 10);

  // 南端の緯度 (度)
  const south = lat1 / 1.5 + lat2 / 12 + lat3 / 120;
  // 西端の経度 (度)
  const west = lng1 + 100 + lng2 / 8 + lng3 / 80;

  // 3次メッシュの1セルサイズ: 緯度 30秒 = 1/120度, 経度 45秒 = 1/80度
  const north = south + 1 / 120;
  const east = west + 1 / 80;

  return [west, south, east, north];
};

/**
 * 3Dタイルファイル名 (例: "3DPC-AL-54401075-20240419-a") から8桁メッシュコードを抽出
 */
export const filenameToMeshCode = (filename: string): string => {
  const parts = filename.split("-");
  return parts[2];
};

/**
 * 2つのバウンディングボックスが重なるかどうかを判定
 */
export const boundsOverlap = (a: Bounds, b: Bounds): boolean => {
  return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
};
