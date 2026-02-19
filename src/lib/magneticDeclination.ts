/**
 * メッシュベースの磁気偏角データによる偏角取得
 * 地理院地図と同じ2次メッシュコードを用いたルックアップ方式
 */

import { meshDeclination } from "@/lib/meshDeclination";

/**
 * 緯度・経度から2次メッシュコードを計算する
 * 地理院地図 gsimaps.js の実装を移植
 */
const get2ndMesh = (lat: number, lng: number): string => {
  const lat1 = Math.floor((lat * 60) / 40);
  const lat2 = (lat * 60) % 40;
  const lon1 = Math.floor(lng - 100);
  const lon2 = lng - 100 - lon1;
  const m2lat = Math.floor(lat2 / 5);
  const m2lon = Math.floor((lon2 * 60) / 7.5);
  return String(lat1) + String(lon1) + String(m2lat) + String(m2lon);
};

/**
 * 指定した緯度・経度における磁気偏角（度）を返す
 * 西偏はマイナス値
 * メッシュデータがない場合（海域など）は null を返す
 */
export const getMagneticDeclination = (
  lat: number,
  lng: number,
): number | null => {
  const meshCode = get2ndMesh(lat, lng);
  if (!(meshCode in meshDeclination)) return null;
  const value = meshDeclination[meshCode];
  // メッシュデータは西偏が正。既存コードの符号規約（西偏が負）に合わせて符号反転
  return -value;
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
