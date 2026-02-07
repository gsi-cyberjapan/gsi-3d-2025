/**
 * GSI多項式近似による磁気偏角の計算
 * 基準点: 東経138度, 北緯37度
 * 参考: https://vldb.gsi.go.jp/sokuchi/geomag/menu_04/index.html
 */

/**
 * 指定した緯度・経度における磁気偏角（度）を返す
 * 西偏はマイナス値
 */
export const getMagneticDeclination = (lat: number, lng: number): number => {
  // 基準点からの差分（度）
  const dLat = lat - 37;
  const dLng = lng - 138;

  // GSI近似多項式（2020年頃の係数）
  const declination =
    -7.6 +
    0.233 * dLat +
    0.631 * dLng -
    0.027 * dLat * dLat -
    0.004 * dLat * dLng -
    0.014 * dLng * dLng;

  return declination;
};

/**
 * 磁気偏角計算が有効な範囲（日本付近）かチェック
 */
export const isValidForMagneticDeclination = (
  lat: number,
  lng: number,
): boolean => {
  return lat >= 20 && lat <= 46 && lng >= 122 && lng <= 154;
};
