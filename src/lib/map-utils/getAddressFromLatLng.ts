/**
 * 緯度・経度から住所文字列を取得（都道府県・市区町村・町名）
 * 国土地理院 lv01_plg GeoJSON を使用
 */

import { GEOCODING_CONFIG } from "@/lib/config";

interface GeoJSONFeature {
  type: string;
  geometry?: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
  properties?: {
    pref?: string;
    muni?: string;
    LV01?: string;
    pref_kana?: string;
    muni_kana?: string;
    Lv01_kana?: string;
  };
}

interface GeoJSONResponse {
  type: string;
  features?: GeoJSONFeature[];
}

interface AddressResult {
  kana: string;
  kanji: string;
}

/**
 * 緯度経度からタイル座標を計算
 */
function getTileInfo(lat: number, lng: number, z: number) {
  const lng_rad = (lng * Math.PI) / 180;
  const R = 128 / Math.PI;
  const worldCoordX = R * (lng_rad + Math.PI);
  const pixelCoordX = worldCoordX * Math.pow(2, z);
  const tileCoordX = Math.floor(pixelCoordX / 256);

  const lat_rad = (lat * Math.PI) / 180;
  const worldCoordY =
    (-R / 2) * Math.log((1 + Math.sin(lat_rad)) / (1 - Math.sin(lat_rad))) +
    128;
  const pixelCoordY = worldCoordY * Math.pow(2, z);
  const tileCoordY = Math.floor(pixelCoordY / 256);

  return {
    x: tileCoordX,
    y: tileCoordY,
    pX: Math.floor(pixelCoordX - tileCoordX * 256),
    pY: Math.floor(pixelCoordY - tileCoordY * 256),
  };
}

/**
 * ポイントがポリゴン内に含まれるかチェック
 */
function isPointInPolygon(point: number[], polygon: number[][]): boolean {
  let wn = 0;

  for (let i = 0; i < polygon.length - 1; i++) {
    if (polygon[i][1] <= point[1] && polygon[i + 1][1] > point[1]) {
      const vt =
        (point[1] - polygon[i][1]) / (polygon[i + 1][1] - polygon[i][1]);
      if (point[0] < polygon[i][0] + vt * (polygon[i + 1][0] - polygon[i][0])) {
        ++wn;
      }
    } else if (polygon[i][1] > point[1] && polygon[i + 1][1] <= point[1]) {
      const vt =
        (point[1] - polygon[i][1]) / (polygon[i + 1][1] - polygon[i][1]);
      if (point[0] < polygon[i][0] + vt * (polygon[i + 1][0] - polygon[i][0])) {
        --wn;
      }
    }
  }
  return wn != 0;
}

export async function getAddressFromLatLng(
  lat: number,
  lon: number,
): Promise<AddressResult | null> {
  // タイル座標を計算
  const zoom = GEOCODING_CONFIG.ADDRESS_TILE.ZOOM;
  const tileInfo = getTileInfo(lat, lon, zoom);

  // GeoJSON を取得
  const url = `${GEOCODING_CONFIG.ADDRESS_TILE.BASE_URL}/${zoom.toString()}/${tileInfo.x.toString()}/${tileInfo.y.toString()}.geojson`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = (await res.json()) as GeoJSONResponse;

  if (!data.features) return null;

  // ポイントが含まれる feature を探す
  const targetPos = [lon, lat];
  let hitFeature: GeoJSONFeature | null = null;

  for (const feature of data.features) {
    if (!feature.geometry) continue;

    let coords = feature.geometry.coordinates;
    if (feature.geometry.type !== "MultiPolygon") {
      coords = [coords as number[][][]];
    }

    for (const polygon of coords as number[][][][]) {
      // 外側のポリゴンでチェック
      let ret = isPointInPolygon(targetPos, polygon[0]);
      if (ret) {
        // くりぬきポリゴン内なら除外
        for (let k = 1; k < polygon.length; k++) {
          const ret2 = isPointInPolygon(targetPos, polygon[k]);
          if (ret2) {
            ret = false;
            break;
          }
        }
        if (ret) {
          hitFeature = feature;
          break;
        }
      }
    }
    if (hitFeature) break;
  }

  if (!hitFeature || !hitFeature.properties) return null;

  const properties = hitFeature.properties;

  // 漢字の住所を生成
  const kanji =
    (properties.pref || "") + (properties.muni || "") + (properties.LV01 || "");

  // かなの住所を生成
  const kana =
    (properties.pref_kana || "") +
    (properties.muni_kana || "") +
    (properties.Lv01_kana || "");

  return {
    kana,
    kanji,
  };
}
