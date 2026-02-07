/**
 * 地域メッシュ（JIS X 0410）
 *
 * 1次メッシュ: 40分(緯度) × 1度(経度) ≈ 80km
 * 2次メッシュ: 5分(緯度) × 7.5分(経度) ≈ 10km
 * 3次メッシュ: 30秒(緯度) × 45秒(経度) ≈ 1km
 */

export interface MeshConfig {
  /** 緯度方向の間隔（度） */
  latInterval: number;
  /** 経度方向の間隔（度） */
  lngInterval: number;
  /** メッシュレベル名 */
  level: string;
}

/**
 * ズームレベルに応じたメッシュ設定を返す
 */
export const getMeshConfig = (zoom: number): MeshConfig | null => {
  if (zoom <= 3) return null;
  if (zoom <= 7) {
    // 1次メッシュ
    return { latInterval: 40 / 60, lngInterval: 1, level: "1次" };
  }
  if (zoom <= 11) {
    // 2次メッシュ
    return { latInterval: 5 / 60, lngInterval: 7.5 / 60, level: "2次" };
  }
  // 3次メッシュ
  return { latInterval: 30 / 3600, lngInterval: 45 / 3600, level: "3次" };
};

/**
 * 緯度・経度から1次メッシュコードを計算
 */
export const get1stMeshCode = (lat: number, lng: number): string => {
  const latCode = Math.floor((lat * 60) / 40);
  const lngCode = Math.floor(lng - 100);
  return `${String(latCode)}${String(lngCode)}`;
};

/**
 * 緯度・経度から2次メッシュコードを計算
 */
export const get2ndMeshCode = (lat: number, lng: number): string => {
  const latCode = Math.floor((lat * 60) / 40);
  const lngCode = Math.floor(lng - 100);
  const latRem = (lat * 60) % 40;
  const lngRem = lng - 100 - lngCode;
  const m2lat = Math.floor(latRem / 5);
  const m2lng = Math.floor((lngRem * 60) / 7.5);
  return `${String(latCode)}${String(lngCode)}${String(m2lat)}${String(m2lng)}`;
};
