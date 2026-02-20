// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "../useIsMobile";

describe("useIsMobile", () => {
  let listeners: Array<() => void>;
  let matchesValue: boolean;

  beforeEach(() => {
    listeners = [];
    matchesValue = false;

    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation(() => ({
        get matches() {
          return matchesValue;
        },
        addEventListener: (_event: string, cb: () => void) => {
          listeners.push(cb);
        },
        removeEventListener: (_event: string, cb: () => void) => {
          listeners = listeners.filter((l) => l !== cb);
        },
      })),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("デスクトップ幅で false を返す", () => {
    matchesValue = false;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("モバイル幅で true を返す", () => {
    matchesValue = true;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("メディアクエリ変更イベントで値が更新される", () => {
    matchesValue = false;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      matchesValue = true;
      for (const listener of listeners) {
        listener();
      }
    });

    expect(result.current).toBe(true);
  });
});
