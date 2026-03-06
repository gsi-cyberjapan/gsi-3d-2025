/**
 * 経緯度グリッドの間隔を秒単位で返す
 * GSI旧システムの設定を2倍密にしたもの
 */
export const getLatLngGridIntervalSeconds = (zoom: number): number => {
  if (zoom <= 3) return 72000; // 20°
  if (zoom === 4) return 36000; // 10°
  if (zoom === 5) return 18000; // 5°
  if (zoom === 6) return 9000; // 2°30'
  if (zoom === 7) return 5400; // 1°30'
  if (zoom === 8) return 3600; // 1°
  if (zoom === 9) return 1800; // 30'
  if (zoom === 10) return 900; // 15'
  if (zoom === 11) return 600; // 10'
  if (zoom === 12) return 300; // 5'
  if (zoom === 13) return 90; // 1'30"
  if (zoom === 14) return 60; // 1'
  if (zoom === 15) return 30; // 30"
  if (zoom === 16) return 15; // 15"
  if (zoom === 17) return 10; // 10"
  return 5; // 5"
};

/**
 * 秒をDMS形式の文字列に変換
 */
export const secondsToDms = (totalSeconds: number, isLat: boolean): string => {
  const abs = Math.abs(totalSeconds);
  const d = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = Math.round(abs % 60);
  const sign = totalSeconds < 0 ? "-" : "";

  if (s === 0 && m === 0) return `${sign}${String(d)}°`;
  if (s === 0) return `${sign}${String(d)}°${String(m)}′`;
  return `${sign}${String(d)}°${String(m)}′${String(s)}″${isLat ? "" : ""}`;
};
