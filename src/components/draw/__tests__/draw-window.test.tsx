// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import { DrawWindow } from "../draw-window";
import { useStore } from "@/hooks/store/useStore";
import type { FeatureGroup } from "@/hooks/useDrawFeatures";

vi.mock("@/hooks/store/useStore", () => ({
  useStore: vi.fn(),
}));

let mockFeatureGroups: FeatureGroup[] = [];
vi.mock("@/hooks/useDrawFeatures", () => ({
  useDrawFeatures: () => mockFeatureGroups,
}));

vi.mock("../draw-file-button", () => ({
  DrawFileButton: () => <div data-testid="draw-file-button" />,
}));

vi.mock("../draw-mode-selector", () => ({
  DrawModeSelector: () => <div data-testid="draw-mode-selector" />,
}));

vi.mock("../feature-source-list", () => ({
  FeatureSourceList: () => <div data-testid="feature-source-list" />,
}));

const mockSetIsDrawWindowOpen = vi.fn();
const mockedUseStore = vi.mocked(useStore);

const setupMock = (isDrawWindowOpen: boolean) => {
  mockedUseStore.mockImplementation(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        isDrawWindowOpen,
        setIsDrawWindowOpen: mockSetIsDrawWindowOpen,
      }),
  );
};

const renderAndFlush = async (isOpen: boolean) => {
  vi.useFakeTimers();
  setupMock(isOpen);
  render(<DrawWindow />);
  // Window コンポーネントの rAF + setTimeout(200) を処理
  await act(async () => {
    vi.advanceTimersByTime(0);
    await vi.advanceTimersByTimeAsync(250);
  });
  vi.useRealTimers();
};

describe("DrawWindow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFeatureGroups = [];
  });

  afterEach(() => {
    cleanup();
  });

  it("isDrawWindowOpen=false で何も表示されない", () => {
    setupMock(false);
    render(<DrawWindow />);
    expect(screen.queryByText("作図")).not.toBeInTheDocument();
  });

  it("isDrawWindowOpen=true でタイトル「作図」が表示される", async () => {
    await renderAndFlush(true);
    expect(screen.getByText("作図")).toBeInTheDocument();
  });

  it("閉じるボタンで setIsDrawWindowOpen(false) が呼ばれる", async () => {
    await renderAndFlush(true);
    const closeButton = screen.getByRole("button", { name: "Close" });
    closeButton.click();
    expect(mockSetIsDrawWindowOpen).toHaveBeenCalledWith(false);
  });

  it("featureGroups が空のとき FeatureSourceList が表示されない", async () => {
    mockFeatureGroups = [];
    await renderAndFlush(true);
    expect(screen.queryByTestId("feature-source-list")).not.toBeInTheDocument();
  });

  it("featureGroups がある場合 FeatureSourceList が表示される", async () => {
    mockFeatureGroups = [
      {
        key: "main:terradraw",
        mapId: "main",
        source: "terradraw",
        featureIds: ["f1"],
        count: 1,
      },
    ];
    await renderAndFlush(true);
    expect(screen.getByTestId("feature-source-list")).toBeInTheDocument();
  });
});
