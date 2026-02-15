/**
 * GSI磁気図2020.0年値の多項式近似による磁気偏角の計算
 * 基準点: 北緯37度, 東経138度
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

  // GSI磁気図2020.0年値の近似多項式（結果は「分」単位、西偏が正）
  const declinationMinutes =
    495.822 +
    18.462 * dLat -
    7.726 * dLng +
    0.007 * dLat * dLat -
    0.007 * dLat * dLng -
    0.655 * dLng * dLng;

  // 分→度に変換、西偏を負値にする（既存コードの符号規約に合わせる）
  return -(declinationMinutes / 60);
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
