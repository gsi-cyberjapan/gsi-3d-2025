/**
 * 緯度・経度から住所文字列を取得（都道府県・市区町村・町名）
 * 国土地理院 reverse-geocoder + muni.js を使用
 */

interface GsiReverseResult {
  results?: {
    muniCd?: string;
    lv01Nm?: string;
  };
}

export async function getAddressFromLatLng(
  lat: number,
  lon: number,
): Promise<string | null> {
  // --- 1. 逆ジオコーディング API 呼び出し ---
  const url = `https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${lat.toString()}&lon=${lon.toString()}`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const json = (await res.json()) as GsiReverseResult;

  const muniCd = json.results?.muniCd;
  const townName = json.results?.lv01Nm;

  if (!muniCd || !townName) return null;

  // --- 2. muni コード → 都道府県・市区町村名 を取得 ---
  // ★ muni.js は JS ファイルなので JSON ではない
  const muniJsUrl = "https://maps.gsi.go.jp/js/muni.js"; // http → https に修正

  const muniRes = await fetch(muniJsUrl);
  if (!muniRes.ok) {
    // 都道府県・市区町村が取れなくても町名だけ返す
    return townName;
  }

  const muniJsText = await muniRes.text();

  // 例: GSI.MUNI_ARRAY["13101"] = '13,東京都,13101,千代田区';
  const pattern = new RegExp(
    String.raw`GSI\.MUNI_ARRAY\["${muniCd}"\]\s*=\s*'([^']+)'`,
  );
  const match = muniJsText.match(pattern);

  if (!match) {
    // 対応が見つからなければとりあえず町名だけ返す
    return townName;
  }

  const record = match[1]; // "13,東京都,13101,千代田区"
  const [, prefecture, , city] = record.split(",");

  return `${prefecture} ${city} ${townName}`;
}
