// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "../search-input";
import { useStore } from "@/hooks/store/useStore";

vi.mock("@/hooks/store/useStore", () => ({
  useStore: vi.fn(),
}));

vi.mock("../search-suggest-list", () => ({
  SearchSuggestList: () => <div data-testid="search-suggest-list" />,
}));

const mockGeocode = vi.fn();
const mockSetIsAddressSearchSuggestOpen = vi.fn();
const mockClearAddressSearchResult = vi.fn();
const mockedUseStore = vi.mocked(useStore);

const setupMock = (overrides: Record<string, unknown> = {}) => {
  const state: Record<string, unknown> = {
    geocode: mockGeocode,
    addressSearchResult: null,
    isAddressSearchSuggestOpen: false,
    setIsAddressSearchSuggestOpen: mockSetIsAddressSearchSuggestOpen,
    clearAddressSearchResult: mockClearAddressSearchResult,
    ...overrides,
  };
  mockedUseStore.mockImplementation(
    (selector: (s: Record<string, unknown>) => unknown) => selector(state),
  );
};

describe("SearchInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMock();
  });

  afterEach(() => {
    cleanup();
  });

  it("placeholder 付きの入力フィールドが表示される", () => {
    render(<SearchInput />);
    expect(
      screen.getByPlaceholderText("地名・住所・緯度経度・UTMで検索"),
    ).toBeInTheDocument();
  });

  it("入力変更で clearAddressSearchResult が呼ばれる", async () => {
    const user = userEvent.setup();
    render(<SearchInput />);
    const input =
      screen.getByPlaceholderText("地名・住所・緯度経度・UTMで検索");
    await user.type(input, "東京");
    expect(mockClearAddressSearchResult).toHaveBeenCalled();
  });

  it("Enter で geocode(value) が呼び出される", async () => {
    const user = userEvent.setup();
    render(<SearchInput />);
    const input =
      screen.getByPlaceholderText("地名・住所・緯度経度・UTMで検索");
    await user.type(input, "東京駅");
    await user.keyboard("{Enter}");
    expect(mockGeocode).toHaveBeenCalledWith("東京駅");
  });

  it("空入力の Enter では geocode が呼ばれない", () => {
    render(<SearchInput />);
    const input =
      screen.getByPlaceholderText("地名・住所・緯度経度・UTMで検索");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockGeocode).not.toHaveBeenCalled();
  });

  it("IME 変換中の Enter では geocode が呼ばれない", async () => {
    const user = userEvent.setup();
    render(<SearchInput />);
    const input =
      screen.getByPlaceholderText("地名・住所・緯度経度・UTMで検索");
    await user.type(input, "東京");
    // isComposing は KeyboardEvent コンストラクタの init dict で設定
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(mockGeocode).not.toHaveBeenCalled();
  });
});
