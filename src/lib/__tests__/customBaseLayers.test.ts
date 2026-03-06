import { describe, expect, it } from "vitest";
import {
  validateTileJSON,
  validateStyleSpec,
  detectFormat,
  parseAndValidate,
  getZoomRange,
} from "@/lib/customBaseLayers";

const validRasterTileJSON = {
  tiles: ["https://example.com/{z}/{x}/{y}.png"],
  minzoom: 2,
  maxzoom: 18,
  name: "Test Raster",
};

const validVectorTileJSON = {
  tiles: ["https://example.com/{z}/{x}/{y}.pbf"],
  minzoom: 0,
  maxzoom: 14,
  vector_layers: [{ id: "roads", fields: {} }],
};

const validStyleSpec = {
  version: 8,
  sources: {
    raster: {
      type: "raster",
      tiles: ["https://example.com/{z}/{x}/{y}.png"],
      minzoom: 0,
      maxzoom: 20,
    },
  },
  layers: [{ id: "raster-layer", type: "raster", source: "raster" }],
};

describe("validateTileJSON", () => {
  it("有効なラスターTileJSONを受け入れる", () => {
    const result = validateTileJSON(validRasterTileJSON);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.tiles).toEqual([
        "https://example.com/{z}/{x}/{y}.png",
      ]);
      expect(result.data.minzoom).toBe(2);
      expect(result.data.maxzoom).toBe(18);
    }
  });

  it("ベクターTileJSONを拒否する", () => {
    const result = validateTileJSON(validVectorTileJSON);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("ベクタータイル");
    }
  });

  it("オブジェクト以外を拒否する", () => {
    expect(validateTileJSON(null).valid).toBe(false);
    expect(validateTileJSON("string").valid).toBe(false);
    expect(validateTileJSON(42).valid).toBe(false);
  });

  it("tiles配列がない場合を拒否する", () => {
    const result = validateTileJSON({ name: "test" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("tiles");
    }
  });

  it("空のtiles配列を拒否する", () => {
    const result = validateTileJSON({ tiles: [] });
    expect(result.valid).toBe(false);
  });

  it("tiles内に文字列以外が含まれる場合を拒否する", () => {
    const result = validateTileJSON({ tiles: [123] });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("array of strings");
    }
  });

  it("空のvector_layers配列は許容する", () => {
    const result = validateTileJSON({
      tiles: ["https://example.com/{z}/{x}/{y}.png"],
      vector_layers: [],
    });
    expect(result.valid).toBe(true);
  });
});

describe("validateStyleSpec", () => {
  it("有効なStyleSpecを受け入れる", () => {
    const result = validateStyleSpec(validStyleSpec);
    expect(result.valid).toBe(true);
  });

  it("version 8以外を拒否する", () => {
    const result = validateStyleSpec({ ...validStyleSpec, version: 7 });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("version");
    }
  });

  it("sourcesがない場合を拒否する", () => {
    const { sources: _, ...noSources } = validStyleSpec;
    void _;
    const result = validateStyleSpec(noSources);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("sources");
    }
  });

  it("layersがない場合を拒否する", () => {
    const { layers: _, ...noLayers } = validStyleSpec;
    void _;
    const result = validateStyleSpec(noLayers);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("layers");
    }
  });

  it("オブジェクト以外を拒否する", () => {
    expect(validateStyleSpec(null).valid).toBe(false);
    expect(validateStyleSpec("string").valid).toBe(false);
  });
});

describe("detectFormat", () => {
  it("StyleSpecを検出する", () => {
    const result = detectFormat(validStyleSpec);
    expect(result.format).toBe("style");
  });

  it("ラスターTileJSONを検出する", () => {
    const result = detectFormat(validRasterTileJSON);
    expect(result.format).toBe("tilejson");
  });

  it("ベクターTileJSONを拒否する", () => {
    const result = detectFormat(validVectorTileJSON);
    expect(result.format).toBeNull();
    if (result.format === null) {
      expect(result.error).toBeDefined();
    }
  });

  it("不明な形式でエラーを返す", () => {
    const result = detectFormat({ unknown: true });
    expect(result.format).toBeNull();
  });
});

describe("parseAndValidate", () => {
  it("有効なTileJSON文字列をパースする", () => {
    const result = parseAndValidate(JSON.stringify(validRasterTileJSON));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.format).toBe("tilejson");
    }
  });

  it("有効なStyleSpec文字列をパースする", () => {
    const result = parseAndValidate(JSON.stringify(validStyleSpec));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.format).toBe("style");
    }
  });

  it("不正なJSON文字列を拒否する", () => {
    const result = parseAndValidate("not json");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Invalid JSON");
    }
  });

  it("ベクターTileJSON文字列を拒否する", () => {
    const result = parseAndValidate(JSON.stringify(validVectorTileJSON));
    expect(result.success).toBe(false);
  });
});

describe("getZoomRange", () => {
  it("TileJSONからズーム範囲を取得する", () => {
    const result = getZoomRange("tilejson", validRasterTileJSON);
    expect(result.minZoom).toBe(2);
    expect(result.maxZoom).toBe(18);
  });

  it("ズーム範囲が未指定の場合デフォルト値を返す", () => {
    const result = getZoomRange("tilejson", {
      tiles: ["https://example.com/{z}/{x}/{y}.png"],
    });
    expect(result.minZoom).toBe(0);
    expect(result.maxZoom).toBe(22);
  });

  it("StyleSpecのsourcesからズーム範囲を推定する", () => {
    const result = getZoomRange("style", validStyleSpec);
    expect(result.minZoom).toBe(0);
    expect(result.maxZoom).toBe(20);
  });

  it("StyleSpecにsourceのズーム範囲がない場合デフォルト値を返す", () => {
    const style = {
      version: 8,
      sources: { s: { type: "raster" } },
      layers: [],
    };
    const result = getZoomRange("style", style);
    expect(result.minZoom).toBe(0);
    expect(result.maxZoom).toBe(22);
  });
});
