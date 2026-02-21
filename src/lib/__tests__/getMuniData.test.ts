import { describe, it, expect, vi, beforeEach } from "vitest";

const MOCK_MUNI_JS = `
GSI.MUNI_ARRAY["01100"] = '01,北海道,01100,札幌市'
GSI.MUNI_ARRAY["13101"] = '13,東京都,13101,千代田区'
GSI.MUNI_ARRAY["27100"] = '27,大阪府,27100,大阪市'
`;

describe("getMuniData", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("正常系: MUNI JS 形式のレスポンスをパースできる", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(MOCK_MUNI_JS),
      }),
    );

    const { getMuniData } = await import("../getMuniData");
    const result = await getMuniData();

    expect(result).not.toBeNull();
    expect(result?.["01100"]).toEqual({
      prefCode: "01",
      prefName: "北海道",
      cityCode: "01100",
      cityName: "札幌市",
    });
    expect(result?.["13101"]).toEqual({
      prefCode: "13",
      prefName: "東京都",
      cityCode: "13101",
      cityName: "千代田区",
    });
    expect(result?.["27100"]).toEqual({
      prefCode: "27",
      prefName: "大阪府",
      cityCode: "27100",
      cityName: "大阪市",
    });
  });

  it("キャッシュ動作: 2回目の呼び出しで fetch が発生しない", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(MOCK_MUNI_JS),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getMuniData } = await import("../getMuniData");
    await getMuniData();
    await getMuniData();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("エラー系: fetch 失敗時に null を返す", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );

    const { getMuniData } = await import("../getMuniData");
    const result = await getMuniData();
    expect(result).toBeNull();
  });

  it("エラー系: !res.ok の場合 null を返す", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    const { getMuniData } = await import("../getMuniData");
    const result = await getMuniData();
    expect(result).toBeNull();
  });
});
