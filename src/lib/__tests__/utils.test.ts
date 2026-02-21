import { describe, expect, it } from "vitest";
import { cn, omit } from "@/lib/utils";

describe("omit", () => {
  it("1キーを削除する", () => {
    const result = omit({ a: 1, b: 2, c: 3 }, "b");
    expect(result).toEqual({ a: 1, c: 3 });
  });

  it("複数キーを削除する", () => {
    const result = omit({ a: 1, b: 2, c: 3 }, "a", "c");
    expect(result).toEqual({ b: 2 });
  });

  it("空オブジェクトを処理する", () => {
    const result = omit({} as Record<string, number>);
    expect(result).toEqual({});
  });

  it("元のオブジェクトを変更しない", () => {
    const original = { a: 1, b: 2 };
    omit(original, "a");
    expect(original).toEqual({ a: 1, b: 2 });
  });
});

describe("cn", () => {
  it("文字列を結合する", () => {
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  it("falsy値を除外する", () => {
    const result = cn("foo", false, null, undefined, "bar");
    expect(result).toBe("foo bar");
  });

  it("Tailwindクラスをマージする", () => {
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
  });

  it("条件付きクラスを処理する", () => {
    const isActive = true as boolean;
    const result = cn("base", isActive && "active");
    expect(result).toBe("base active");
  });
});
