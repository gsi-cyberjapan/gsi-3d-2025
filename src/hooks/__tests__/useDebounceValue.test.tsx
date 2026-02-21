// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedValue } from "../useDebounceValue";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("初期値がそのまま返る", () => {
    const { result } = renderHook(() => useDebouncedValue("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("指定ms経過後にデバウンス値が更新される", () => {
    const { result, rerender } = renderHook(
      ({ value, ms }) => useDebouncedValue(value, ms),
      { initialProps: { value: "initial", ms: 300 } },
    );

    rerender({ value: "updated", ms: 300 });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("updated");
  });

  it("値が連続変更された場合、最後の値のみが反映される", () => {
    const { result, rerender } = renderHook(
      ({ value, ms }) => useDebouncedValue(value, ms),
      { initialProps: { value: "a", ms: 300 } },
    );

    rerender({ value: "b", ms: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "c", ms: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "d", ms: 300 });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("d");
  });

  it("数値型でも動作する", () => {
    const { result, rerender } = renderHook(
      ({ value, ms }) => useDebouncedValue(value, ms),
      { initialProps: { value: 0, ms: 500 } },
    );

    rerender({ value: 42, ms: 500 });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe(42);
  });
});
