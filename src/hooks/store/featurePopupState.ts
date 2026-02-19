import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";
import { MapId } from "./mapManagerState";

export interface FeaturePopupFeature {
  layerId: string;
  sourceLayer: string;
  properties: Record<string, unknown>;
}

export interface FeaturePopupInfo {
  longitude: number;
  latitude: number;
  features: FeaturePopupFeature[];
}

export interface FeaturePopupState {
  /** マップごとのポップアップ情報 */
  featurePopups: Record<MapId, FeaturePopupInfo | null>;
  /** ポップアップ表示 */
  showFeaturePopup: ({
    mapId,
    popup,
  }: {
    mapId: MapId;
    popup: FeaturePopupInfo;
  }) => void;
  /** ポップアップ閉じる */
  closeFeaturePopup: (mapId: MapId) => void;
}

export const createFeaturePopupSlice: StateCreator<
  GlobalState,
  [],
  [],
  FeaturePopupState
> = (set) => ({
  featurePopups: { main: null, sub: null },
  showFeaturePopup: ({ mapId, popup }) => {
    set((state) => ({
      featurePopups: { ...state.featurePopups, [mapId]: popup },
    }));
  },
  closeFeaturePopup: (mapId) => {
    set((state) => ({
      featurePopups: { ...state.featurePopups, [mapId]: null },
    }));
  },
});
