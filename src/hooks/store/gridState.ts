import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";

export interface GridState {
  /** 緯度・経度グリッド */
  isDisplayLatLngGrid: boolean;
  setIsDisplayLatLngGrid: (value: boolean) => void;
  /** UTMグリッド */
  isDisplayUtmGrid: boolean;
  setIsDisplayUtmGrid: (value: boolean) => void;
  /** タイル座標 */
  isDisplayTileGrid: boolean;
  setIsDisplayTileGrid: (value: boolean) => void;
  /** 地域メッシュ */
  isDisplayRegionalMesh: boolean;
  setIsDisplayRegionalMesh: (value: boolean) => void;
  /** 図郭番号 */
  isDisplayMapSheetNumbers: boolean;
  setIsDisplayMapSheetNumbers: (value: boolean) => void;
}

export const createGridSlice: StateCreator<GlobalState, [], [], GridState> = (
  set,
) => ({
  isDisplayLatLngGrid: false,
  setIsDisplayLatLngGrid: (value) => {
    set(() => ({ isDisplayLatLngGrid: value }));
  },
  isDisplayUtmGrid: false,
  setIsDisplayUtmGrid: (value) => {
    set(() => ({ isDisplayUtmGrid: value }));
  },
  isDisplayTileGrid: false,
  setIsDisplayTileGrid: (value) => {
    set(() => ({ isDisplayTileGrid: value }));
  },
  isDisplayRegionalMesh: false,
  setIsDisplayRegionalMesh: (value) => {
    set(() => ({ isDisplayRegionalMesh: value }));
  },
  isDisplayMapSheetNumbers: false,
  setIsDisplayMapSheetNumbers: (value) => {
    set(() => ({ isDisplayMapSheetNumbers: value }));
  },
});
