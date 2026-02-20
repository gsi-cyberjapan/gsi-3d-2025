import { describe, expect, it } from "vitest";
import {
  colorToRgba,
  hexToRgb,
  hexToRgba,
  hslToRgb,
  hslaToRgba,
  rgbToHex,
  rgbToHsl,
  rgbaToColorAndOpacity,
  rgbaToHex,
  rgbaToHsla,
} from "../colorConverter";

describe("hexToRgb", () => {
  it("赤色を変換する", () => {
    expect(hexToRgb("#FF0000")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("黒色を変換する", () => {
    expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("白色を変換する", () => {
    expect(hexToRgb("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("#なしの入力を処理する", () => {
    expect(hexToRgb("FF0000")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("小文字の入力を処理する", () => {
    expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("不正な文字列はデフォルト値を返す", () => {
    expect(hexToRgb("invalid")).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("空文字列はデフォルト値を返す", () => {
    expect(hexToRgb("")).toEqual({ r: 0, g: 0, b: 0 });
  });
});

describe("rgbToHex", () => {
  it("赤色を変換する", () => {
    expect(rgbToHex(255, 0, 0)).toBe("#FF0000");
  });

  it("黒色を変換する", () => {
    expect(rgbToHex(0, 0, 0)).toBe("#000000");
  });

  it("白色を変換する", () => {
    expect(rgbToHex(255, 255, 255)).toBe("#FFFFFF");
  });

  it("任意の色を変換する", () => {
    expect(rgbToHex(128, 64, 32)).toBe("#804020");
  });
});

describe("rgbToHsl", () => {
  it("赤色を変換する", () => {
    expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 });
  });

  it("緑色を変換する", () => {
    expect(rgbToHsl(0, 255, 0)).toEqual({ h: 120, s: 100, l: 50 });
  });

  it("青色を変換する", () => {
    expect(rgbToHsl(0, 0, 255)).toEqual({ h: 240, s: 100, l: 50 });
  });

  it("白色を変換する", () => {
    expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 });
  });

  it("黒色を変換する", () => {
    expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 });
  });

  it("グレーを変換する", () => {
    expect(rgbToHsl(128, 128, 128)).toEqual({ h: 0, s: 0, l: 50 });
  });
});

describe("hslToRgb", () => {
  it("赤色を変換する", () => {
    expect(hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("緑色を変換する", () => {
    expect(hslToRgb(120, 100, 50)).toEqual({ r: 0, g: 255, b: 0 });
  });

  it("青色を変換する", () => {
    expect(hslToRgb(240, 100, 50)).toEqual({ r: 0, g: 0, b: 255 });
  });

  it("白色を変換する", () => {
    expect(hslToRgb(0, 0, 100)).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("黒色を変換する", () => {
    expect(hslToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 });
  });
});

describe("rgbToHsl / hslToRgb 往復テスト", () => {
  const testColors = [
    { r: 255, g: 0, b: 0 },
    { r: 0, g: 255, b: 0 },
    { r: 0, g: 0, b: 255 },
    { r: 255, g: 255, b: 0 },
    { r: 128, g: 64, b: 32 },
  ];

  for (const color of testColors) {
    it(`rgb(${String(color.r)},${String(color.g)},${String(color.b)}) の往復変換`, () => {
      const hsl = rgbToHsl(color.r, color.g, color.b);
      const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
      expect(rgb.r).toBeCloseTo(color.r, -1);
      expect(rgb.g).toBeCloseTo(color.g, -1);
      expect(rgb.b).toBeCloseTo(color.b, -1);
    });
  }
});

describe("hexToRgba", () => {
  it("6桁のhexはalpha=1で返す", () => {
    const result = hexToRgba("#FF0000");
    expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it("8桁のhexはalphaを計算する", () => {
    const result = hexToRgba("#FF000080");
    expect(result.r).toBe(255);
    expect(result.g).toBe(0);
    expect(result.b).toBe(0);
    expect(result.a).toBeCloseTo(128 / 255, 2);
  });

  it("不正入力はデフォルト値を返す", () => {
    expect(hexToRgba("#GG")).toEqual({ r: 0, g: 0, b: 0, a: 1 });
  });
});

describe("rgbaToHex", () => {
  it("完全不透明な赤色を変換する", () => {
    expect(rgbaToHex(255, 0, 0, 1.0)).toBe("#FF0000FF");
  });

  it("半透明な赤色を変換する", () => {
    expect(rgbaToHex(255, 0, 0, 0.5)).toBe("#FF000080");
  });

  it("完全透明を変換する", () => {
    expect(rgbaToHex(0, 0, 0, 0)).toBe("#00000000");
  });
});

describe("rgbaToHsla", () => {
  it("alphaをそのまま保持する", () => {
    const result = rgbaToHsla(255, 0, 0, 0.5);
    expect(result).toEqual({ h: 0, s: 100, l: 50, a: 0.5 });
  });
});

describe("hslaToRgba", () => {
  it("alphaをそのまま保持する", () => {
    const result = hslaToRgba(0, 100, 50, 0.5);
    expect(result).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
  });
});

describe("colorToRgba", () => {
  it("7桁hexとopacityを結合する", () => {
    expect(colorToRgba("#FF0000", 0.5)).toBe("#FF000080");
  });

  it("opacity=1で完全不透明", () => {
    expect(colorToRgba("#FF0000", 1)).toBe("#FF0000FF");
  });

  it("opacity=0で完全透明", () => {
    expect(colorToRgba("#FF0000", 0)).toBe("#FF000000");
  });

  it("9桁hexはそのまま返す", () => {
    expect(colorToRgba("#FF000080", 0.5)).toBe("#FF000080");
  });

  it("不正フォーマットはFFを付加する", () => {
    const result = colorToRgba("#F", 0.5);
    expect(result).toMatch(/FF$/);
  });

  it("#なしの入力を処理する", () => {
    expect(colorToRgba("FF0000", 1)).toBe("#FF0000FF");
  });

  it("opacityの範囲をクランプする", () => {
    expect(colorToRgba("#FF0000", 2)).toBe("#FF0000FF");
    expect(colorToRgba("#FF0000", -1)).toBe("#FF000000");
  });
});

describe("rgbaToColorAndOpacity", () => {
  it("7桁hexはopacity=1を返す", () => {
    expect(rgbaToColorAndOpacity("#FF0000")).toEqual({
      color: "#FF0000",
      opacity: 1,
    });
  });

  it("9桁hexを分解する", () => {
    const result = rgbaToColorAndOpacity("#FF000080");
    expect(result.color).toBe("#FF0000");
    expect(result.opacity).toBeCloseTo(0.5, 1);
  });

  it("完全不透明の9桁hexを分解する", () => {
    const result = rgbaToColorAndOpacity("#FF0000FF");
    expect(result.color).toBe("#FF0000");
    expect(result.opacity).toBe(1);
  });

  it("不正入力はopacity=1を返す", () => {
    expect(rgbaToColorAndOpacity("#F")).toEqual({
      color: "#F",
      opacity: 1,
    });
  });

  it("#なしの入力を処理する", () => {
    const result = rgbaToColorAndOpacity("FF0000");
    expect(result.color).toBe("#FF0000");
    expect(result.opacity).toBe(1);
  });
});
