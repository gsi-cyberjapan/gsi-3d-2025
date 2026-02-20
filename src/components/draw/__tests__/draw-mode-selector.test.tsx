// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DrawModeSelector } from "../draw-mode-selector";
import type { DrawMode } from "@/hooks/store/drawState";
import { useStore } from "@/hooks/store/useStore";

vi.mock("@/hooks/store/useStore", () => ({
  useStore: vi.fn(),
}));

const mockSetDrawMode = vi.fn();
const mockedUseStore = vi.mocked(useStore);

const setupMock = (drawMode: DrawMode) => {
  mockedUseStore.mockImplementation(
    (selector: (state: Record<string, unknown>) => unknown) =>
      selector({
        drawMode,
        setDrawMode: mockSetDrawMode,
      }),
  );
};

// MODES の順序と一致（draw-mode-selector.tsx の定義順）
const MODE_ORDER: DrawMode[] = [
  "point",
  "circle",
  "linestring",
  "freehand-linestring",
  "polygon",
  "text",
  "select",
];

describe("DrawModeSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMock("circle");
  });

  afterEach(() => {
    cleanup();
  });

  it("全7つの描画モードタブが表示される", () => {
    render(<DrawModeSelector />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(7);
  });

  it("現在の drawMode が選択状態になる", () => {
    setupMock("polygon");
    render(<DrawModeSelector />);
    const tabs = screen.getAllByRole("tab");
    const polygonIndex = MODE_ORDER.indexOf("polygon");
    expect(tabs[polygonIndex]).toHaveAttribute("aria-selected", "true");
  });

  it("タブクリックで setDrawMode が正しい値で呼ばれる", async () => {
    const user = userEvent.setup();
    render(<DrawModeSelector />);
    const tabs = screen.getAllByRole("tab");
    // point は最初のタブ (index 0)
    await user.click(tabs[0]);
    expect(mockSetDrawMode).toHaveBeenCalledWith("point");
  });
});
