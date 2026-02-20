import { describe, expect, it } from "vitest";
import { latToTileY, lngToTileX, tileXToLng, tileYToLat } from "../tileGrid";

describe("latToTileY", () => {
  it("東京(35.68)のzoom=10でのタイルY座標", () => {
    const y = latToTileY(35.68, 10);
    expect(y).toBe(403);
  });

  it("赤道(0)のzoom=10でのタイルY座標", () => {
    const y = latToTileY(0, 10);
    expect(y).toBe(512);
  });
});

describe("lngToTileX", () => {
  it("東京(139.69)のzoom=10でのタイルX座標", () => {
    const x = lngToTileX(139.69, 10);
    expect(x).toBe(909);
  });

  it("グリニッジ(0)のzoom=10でのタイルX座標", () => {
    const x = lngToTileX(0, 10);
    expect(x).toBe(512);
  });
});

describe("tileYToLat", () => {
  it("zoom=10でタイルY=403を緯度に変換", () => {
    const lat = tileYToLat(403, 10);
    expect(lat).toBeCloseTo(35.89, 0);
  });
});

describe("tileXToLng", () => {
  it("zoom=10でタイルX=909を経度に変換", () => {
    const lng = tileXToLng(909, 10);
    expect(lng).toBeCloseTo(139.57, 0);
  });
});

describe("往復変換テスト", () => {
  const testCases = [
    { lat: 35.68, lng: 139.69, zoom: 10 },
    { lat: 0, lng: 0, zoom: 5 },
    { lat: 43.06, lng: 141.35, zoom: 12 },
  ];

  for (const { lat, lng, zoom } of testCases) {
    it(`lat=${String(lat)}, lng=${String(lng)}, zoom=${String(zoom)} の往復変換`, () => {
      const tileY = latToTileY(lat, zoom);
      const recoveredLat = tileYToLat(tileY, zoom);
      // タイルの左上座標なので、元の緯度と同じタイルに含まれることを確認
      expect(latToTileY(recoveredLat, zoom)).toBe(tileY);

      const tileX = lngToTileX(lng, zoom);
      const recoveredLng = tileXToLng(tileX, zoom);
      expect(lngToTileX(recoveredLng, zoom)).toBe(tileX);
    });
  }
});
