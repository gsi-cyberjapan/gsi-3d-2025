import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getOptionalLayers,
  buildLayerMetadataCache,
  getLayerMetadata,
} from "../getOptionalLayers";
import type { OptionalLayerEntry } from "../getOptionalLayers";

describe("getOptionalLayers", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("正常系: ルート定義とレイヤー定義を取得してツリーを構築できる", async () => {
    const rootDefinition = [{ url: "/layers/layer1.json" }];
    const layerData = {
      layers: [
        {
          type: "Layer",
          id: "test-layer",
          title: "テストレイヤー",
          url: "https://example.com/{z}/{x}/{y}.png",
          minZoom: 4,
          maxZoom: 18,
        },
      ],
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(rootDefinition),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(layerData),
      } as Response);

    const result = await getOptionalLayers();
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("layer");
    if (result[0].type === "layer") {
      expect(result[0].id).toBe("test-layer");
      expect(result[0].title).toBe("テストレイヤー");
      expect(result[0].tileUrl).toBe("https://example.com/{z}/{x}/{y}.png");
    }
  });

  it("正常系: LayerGroup を含むツリーを構築できる", async () => {
    const rootDefinition = [{ url: "/layers/group.json" }];
    const groupData = {
      layers: [
        {
          type: "LayerGroup",
          title: "テストグループ",
          iconUrl: "/images/icon.png",
          entries: [
            {
              type: "Layer",
              id: "child-layer",
              title: "子レイヤー",
              url: "https://example.com/child/{z}/{x}/{y}.png",
            },
          ],
        },
      ],
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(rootDefinition),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(groupData),
      } as Response);

    const result = await getOptionalLayers();
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("layer-group");
    if (result[0].type === "layer-group") {
      expect(result[0].title).toBe("テストグループ");
      expect(result[0].entries).toHaveLength(1);
      expect(result[0].legendImageUrl).toContain("images/icon.png");
    }
  });

  it("正常系: Layer の title から <br> が改行に変換される", async () => {
    const rootDefinition = [{ url: "/layers/layer1.json" }];
    const layerData = {
      layers: [
        {
          type: "Layer",
          id: "br-layer",
          title: "地すべり地形分布図<br>日本全国版",
          url: "https://example.com/{z}/{x}/{y}.png",
        },
      ],
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(rootDefinition),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(layerData),
      } as Response);

    const result = await getOptionalLayers();
    expect(result).toHaveLength(1);
    if (result[0].type === "layer") {
      expect(result[0].title).toBe("地すべり地形分布図\n日本全国版");
    }
  });

  it("正常系: LayerGroup の title から <br /> バリエーションが改行に変換される", async () => {
    const rootDefinition = [{ url: "/layers/group.json" }];
    const groupData = {
      layers: [
        {
          type: "LayerGroup",
          title: "グループ名<br />改行後",
          entries: [
            {
              type: "Layer",
              id: "child",
              title: "子レイヤー",
              url: "https://example.com/{z}/{x}/{y}.png",
            },
          ],
        },
      ],
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(rootDefinition),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(groupData),
      } as Response);

    const result = await getOptionalLayers();
    expect(result).toHaveLength(1);
    if (result[0].type === "layer-group") {
      expect(result[0].title).toBe("グループ名\n改行後");
    }
  });

  it("エラー系: ルート定義の fetch 失敗", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    await expect(getOptionalLayers()).rejects.toThrow();
  });

  it("エラー系: レイヤー定義の fetch 失敗", async () => {
    const rootDefinition = [{ url: "/layers/fail.json" }];

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(rootDefinition),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

    await expect(getOptionalLayers()).rejects.toThrow();
  });
});

describe("buildLayerMetadataCache / getLayerMetadata", () => {
  it("レイヤーメタデータをキャッシュし取得できる", () => {
    const entries: OptionalLayerEntry[] = [
      {
        type: "layer",
        id: "layer-1",
        title: "テスト",
        tileUrl: "https://example.com/{z}/{x}/{y}.png",
        html: "<p>説明</p>",
        legendUrl: "https://example.com/legend.png",
      },
    ];

    buildLayerMetadataCache(entries);
    const meta = getLayerMetadata("layer-1");
    expect(meta).toBeDefined();
    expect(meta?.html).toBe("<p>説明</p>");
    expect(meta?.legendUrl).toBe("https://example.com/legend.png");
  });

  it("ネストした layer-group 内のレイヤーも取得できる", () => {
    const entries: OptionalLayerEntry[] = [
      {
        type: "layer-group",
        title: "グループ",
        entries: [
          {
            type: "layer",
            id: "nested-layer",
            title: "ネストレイヤー",
            tileUrl: "https://example.com/{z}/{x}/{y}.png",
            html: "<p>ネスト</p>",
          },
        ],
      },
    ];

    buildLayerMetadataCache(entries);
    const meta = getLayerMetadata("nested-layer");
    expect(meta).toBeDefined();
    expect(meta?.html).toBe("<p>ネスト</p>");
  });

  it("メタデータのないレイヤーは undefined を返す", () => {
    buildLayerMetadataCache([]);
    expect(getLayerMetadata("non-existent")).toBeUndefined();
  });
});
