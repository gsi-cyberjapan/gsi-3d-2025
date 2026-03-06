// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { BaseLayerSelector } from "../base-layer-selector";
import { useStore } from "@/hooks/store/useStore";
import type { BaseLayer } from "@/lib/getBaseLayers";

vi.mock("@/hooks/store/useStore", () => ({
  useStore: vi.fn(),
}));

const MOCK_LAYERS: BaseLayer[] = [
  {
    id: "std-vector",
    type: "vector",
    label: "標準地図",
    legendImageUrl: "/images/std.png",
    styleUrl: "https://example.com/style.json",
    minZoom: 4,
    maxZoom: 16,
  },
  {
    id: "pale-vector",
    type: "vector",
    label: "淡色地図",
    legendImageUrl: "/images/pale.png",
    styleUrl: "https://example.com/pale.json",
    minZoom: 4,
    maxZoom: 16,
  },
  {
    id: "photo-raster",
    type: "raster",
    label: "写真",
    legendImageUrl: "/images/photo.png",
    errorImageUrl: "/images/error.png",
    tileUrl: "https://example.com/{z}/{x}/{y}.png",
    minZoom: 2,
    maxZoom: 18,
  },
];

vi.mock("@/lib/getBaseLayers", () => ({
  getBaseLayers: () => MOCK_LAYERS,
}));

vi.mock("@/lib/customBaseLayers", () => ({
  getCustomLayers: () => [],
  deleteCustomLayer: vi.fn(),
  MAX_CUSTOM_LAYERS: 5,
}));

vi.mock("../custom-layer-dialog", () => ({
  CustomLayerDialog: () => <div data-testid="custom-layer-dialog" />,
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string; fill?: boolean }) => (
    <img src={src} alt={alt} />
  ),
}));

const mockSetBaseLayer = vi.fn();
const mockedUseStore = vi.mocked(useStore);

const setupMock = (baseLayer: BaseLayer = MOCK_LAYERS[0]) => {
  mockedUseStore.mockImplementation(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        focusMapId: "main",
        maps: { main: { baseLayer }, sub: { baseLayer: MOCK_LAYERS[0] } },
        setBaseLayer: mockSetBaseLayer,
      }),
  );
};

describe("BaseLayerSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMock();
  });

  afterEach(() => {
    cleanup();
  });

  it("現在のベースレイヤー名が表示される", () => {
    render(<BaseLayerSelector />);
    expect(screen.getByText("標準地図")).toBeInTheDocument();
  });

  it("Vector タイプラベルが表示される", () => {
    render(<BaseLayerSelector />);
    expect(screen.getByText("ベクトル形式")).toBeInTheDocument();
  });

  it("Raster レイヤーが選択されている場合に Raster ラベルが表示される", () => {
    setupMock(MOCK_LAYERS[2]);
    render(<BaseLayerSelector />);
    expect(screen.getByText("写真")).toBeInTheDocument();
    expect(screen.getByText("画像形式")).toBeInTheDocument();
  });

  it("ベースレイヤーの画像が表示される", () => {
    render(<BaseLayerSelector />);
    const img = screen.getByAltText("標準地図のアイコン");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/images/std.png");
  });

  it("Select トリガーが combobox ロールで表示される", () => {
    render(<BaseLayerSelector />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
