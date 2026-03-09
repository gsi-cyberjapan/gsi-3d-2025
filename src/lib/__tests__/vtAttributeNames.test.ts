import { describe, expect, it } from "vitest";
import {
  VT_ATTRIBUTE_NAMES,
  VT_CODE_NAMES,
  getAttributeLabel,
  getVtCodeName,
} from "@/lib/vtAttributeNames";

describe("getAttributeLabel", () => {
  it("vt_codeの論理名を返す", () => {
    expect(getAttributeLabel("vt_code")).toBe("地物種別コード");
  });

  it("vt_rdctgの論理名を返す", () => {
    expect(getAttributeLabel("vt_rdctg")).toBe("道路分類");
  });

  it("未知の属性名にはundefinedを返す", () => {
    expect(getAttributeLabel("unknown_attr")).toBeUndefined();
  });

  it("全ての属性名が空でない文字列を持つ", () => {
    for (const [key, value] of Object.entries(VT_ATTRIBUTE_NAMES)) {
      expect(key).toBeTruthy();
      expect(value).toBeTruthy();
    }
  });
});

describe("getVtCodeName", () => {
  it("注記分類コードの名称を返す", () => {
    expect(getVtCodeName(110)).toBe("市区町村");
    expect(getVtCodeName(422)).toBe("鉄道駅名");
  });

  it("地物種別コードの名称を返す", () => {
    expect(getVtCodeName(2701)).toBe("道路中心線（通常部）");
    expect(getVtCodeName(3101)).toBe("普通建物");
    expect(getVtCodeName(8201)).toBe("鉄道中心線");
  });

  it("未知のコードにはundefinedを返す", () => {
    expect(getVtCodeName(9999)).toBeUndefined();
  });

  it("全てのコードが空でない文字列を持つ", () => {
    for (const [code, name] of Object.entries(VT_CODE_NAMES)) {
      expect(Number(code)).not.toBeNaN();
      expect(name).toBeTruthy();
    }
  });
});
