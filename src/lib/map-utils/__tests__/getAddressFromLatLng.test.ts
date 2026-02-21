import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getAddressFromLatLng } from "../getAddressFromLatLng";

describe("getAddressFromLatLng", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("正常系: ポリゴン内の座標から住所を返す", async () => {
    const mockGeoJSON = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [139.74, 35.67],
                [139.78, 35.67],
                [139.78, 35.7],
                [139.74, 35.7],
                [139.74, 35.67],
              ],
            ],
          },
          properties: {
            pref: "東京都",
            muni: "千代田区",
            LV01: "永田町一丁目",
            pref_kana: "とうきょうと",
            muni_kana: "ちよだく",
            Lv01_kana: "ながたちょういっちょうめ",
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGeoJSON),
    } as Response);

    const result = await getAddressFromLatLng(35.68, 139.76);
    expect(result).not.toBeNull();
    expect(result?.kanji).toBe("東京都千代田区永田町一丁目");
    expect(result?.kana).toBe("とうきょうとちよだくながたちょういっちょうめ");
  });

  it("!res.ok の場合 null を返す", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
    } as Response);

    const result = await getAddressFromLatLng(35.68, 139.76);
    expect(result).toBeNull();
  });

  it("features が空の場合 null を返す", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ type: "FeatureCollection", features: [] }),
    } as Response);

    const result = await getAddressFromLatLng(35.68, 139.76);
    expect(result).toBeNull();
  });

  it("features が undefined の場合 null を返す", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ type: "FeatureCollection" }),
    } as Response);

    const result = await getAddressFromLatLng(35.68, 139.76);
    expect(result).toBeNull();
  });

  it("ポリゴン外の座標では null を返す", async () => {
    const mockGeoJSON = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [139.74, 35.67],
                [139.75, 35.67],
                [139.75, 35.68],
                [139.74, 35.68],
                [139.74, 35.67],
              ],
            ],
          },
          properties: {
            pref: "東京都",
            muni: "千代田区",
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGeoJSON),
    } as Response);

    const result = await getAddressFromLatLng(36.0, 140.0);
    expect(result).toBeNull();
  });

  it("MultiPolygon のジオメトリにも対応する", async () => {
    const mockGeoJSON = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "MultiPolygon",
            coordinates: [
              [
                [
                  [139.74, 35.67],
                  [139.78, 35.67],
                  [139.78, 35.7],
                  [139.74, 35.7],
                  [139.74, 35.67],
                ],
              ],
            ],
          },
          properties: {
            pref: "東京都",
            muni: "港区",
            LV01: "六本木",
            pref_kana: "とうきょうと",
            muni_kana: "みなとく",
            Lv01_kana: "ろっぽんぎ",
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGeoJSON),
    } as Response);

    const result = await getAddressFromLatLng(35.68, 139.76);
    expect(result).not.toBeNull();
    expect(result?.kanji).toBe("東京都港区六本木");
  });
});
