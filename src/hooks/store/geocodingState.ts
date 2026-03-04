import { AddressSearchResult, geocode } from "@/lib/geocode";
import { LngLat } from "maplibre-gl";
import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";

export interface GeocodingState {
  /** 検索結果対象の緯度経度 */
  resultLngLat: LngLat | null;
  /** 住所検索の結果 */
  addressSearchResult: AddressSearchResult | null;
  /** 住所検索中かどうか */
  isAddressSearchLoading: boolean;
  /** 住所検索のサジェストの表示状態 */
  isAddressSearchSuggestOpen: boolean;
  setIsAddressSearchSuggestOpen: (value: boolean) => void;
  /** ホバーしている住所検索のサジェスト */
  hoveringAddressSearchSuggestId: string | null;
  setHoveringAddressSearchSuggestId: (candidateId: string | null) => void;
  /** 住所検索のサジェストの選択 */
  setSelectedAddressCandidate: (candidateId: string) => void;
  /** 選択された住所検索のサジェスト */
  selectedAddrssCandidate: AddressSearchResult["candidates"][number] | null;
  /** ジオコーディングの実行 */
  geocode: (query: string) => Promise<void>;
  /** 住所検索の状態初期化 */
  clearAddressSearchResult: () => void;
}

export const createGeocodingSlice: StateCreator<
  GlobalState,
  [],
  [],
  GeocodingState
> = (set, get) => ({
  resultLngLat: null,
  addressSearchResult: null,
  isAddressSearchLoading: false,
  isAddressSearchSuggestOpen: false,
  setIsAddressSearchSuggestOpen: (value) => {
    set({ isAddressSearchSuggestOpen: value });
  },
  hoveringAddressSearchSuggestId: null,
  setHoveringAddressSearchSuggestId: (candidateId: string | null) => {
    set({ hoveringAddressSearchSuggestId: candidateId });
  },
  setSelectedAddressCandidate: (candidateId: string) => {
    const { addressSearchResult: suggest } = get();
    const target = suggest?.candidates.find((c) => c.id === candidateId);
    if (!target) return;
    set({ selectedAddrssCandidate: target, resultLngLat: target.lnglat });
  },
  selectedAddrssCandidate: null,
  geocode: async (query) => {
    try {
      const result = geocode(query);

      if (result.type === "point") {
        set({
          resultLngLat: result.lnglat,
        });
        return;
      }

      set({ isAddressSearchLoading: true, isAddressSearchSuggestOpen: true });
      const addressSearchResult = await result.getAddressSearchResult;
      set({ addressSearchResult, isAddressSearchLoading: false });
    } catch (error) {
      console.error("Geocoding failed:", error);
    }
  },
  clearAddressSearchResult: () => {
    set({
      addressSearchResult: null,
      selectedAddrssCandidate: null,
      hoveringAddressSearchSuggestId: null,
      isAddressSearchSuggestOpen: false,
    });
  },
});
