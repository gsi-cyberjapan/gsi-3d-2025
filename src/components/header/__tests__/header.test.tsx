// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "../header";
import { useStore } from "@/hooks/store/useStore";

vi.mock("@/hooks/store/useStore", () => ({
  useStore: vi.fn(),
}));

vi.mock("../logo", () => ({
  Logo: () => <div data-testid="logo" />,
}));

vi.mock("../search-input", () => ({
  SearchInput: () => <div data-testid="search-input" />,
}));

vi.mock("@/components/share/share-dialog", () => ({
  ShareDialog: () => <div data-testid="share-dialog" />,
}));

vi.mock("../others-dropdown-content", () => ({
  OthersDropdownContent: () => <div data-testid="others-dropdown" />,
}));

vi.mock("../setting-dropdown-content", () => ({
  SettingDropdownContent: () => <div data-testid="setting-dropdown" />,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    target?: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const mockSetIsDrawWindowOpen = vi.fn();
const mockSetIsMeasureWindowOpen = vi.fn();
const mockSetIsSaveImageWindowOpen = vi.fn();
const mockSetIsPrintDialogOpen = vi.fn();
const mockSetIsShareDialogOpen = vi.fn();
const mockedUseStore = vi.mocked(useStore);

const setupMock = () => {
  mockedUseStore.mockImplementation(
    (selector: (s: Record<string, unknown>) => unknown) =>
      selector({
        setIsDrawWindowOpen: mockSetIsDrawWindowOpen,
        setIsMeasureWindowOpen: mockSetIsMeasureWindowOpen,
        setIsSaveImageWindowOpen: mockSetIsSaveImageWindowOpen,
        setIsPrintDialogOpen: mockSetIsPrintDialogOpen,
        setIsShareDialogOpen: mockSetIsShareDialogOpen,
      }),
  );
};

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMock();
  });

  afterEach(() => {
    cleanup();
  });

  it("主要なボタンが表示される", () => {
    render(<Header />);
    expect(screen.getByText("計測")).toBeInTheDocument();
    expect(screen.getByText("作図")).toBeInTheDocument();
    expect(screen.getByText("保存")).toBeInTheDocument();
    expect(screen.getByText("共有")).toBeInTheDocument();
    expect(screen.getByText("ヘルプ")).toBeInTheDocument();
  });

  it("計測ボタンで setIsMeasureWindowOpen(true) が呼ばれる", async () => {
    const user = userEvent.setup();
    render(<Header />);
    const buttons = screen.getAllByText("計測");
    // desktop 用のボタン（md:flex 内）をクリック
    await user.click(buttons[0]);
    expect(mockSetIsMeasureWindowOpen).toHaveBeenCalledWith(true);
  });

  it("作図ボタンで setIsDrawWindowOpen(true) が呼ばれる", async () => {
    const user = userEvent.setup();
    render(<Header />);
    const buttons = screen.getAllByText("作図");
    await user.click(buttons[0]);
    expect(mockSetIsDrawWindowOpen).toHaveBeenCalledWith(true);
  });

  it("共有ボタンで setIsShareDialogOpen(true) が呼ばれる", async () => {
    const user = userEvent.setup();
    render(<Header />);
    const buttons = screen.getAllByText("共有");
    await user.click(buttons[0]);
    expect(mockSetIsShareDialogOpen).toHaveBeenCalledWith(true);
  });

  it("ヘルプリンクが正しいURLを持つ", () => {
    render(<Header />);
    const helpLinks = screen.getAllByText("ヘルプ");
    // 最初の「ヘルプ」テキストの親リンクを探す
    const link = helpLinks[0].closest("a");
    expect(link).toHaveAttribute("href", "http://maps.gsi.go.jp/help/");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("SearchInput コンポーネントが表示される", () => {
    render(<Header />);
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  it("Logo コンポーネントが表示される", () => {
    render(<Header />);
    expect(screen.getByTestId("logo")).toBeInTheDocument();
  });
});
