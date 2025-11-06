import { StateCreator } from "zustand";

type MapViewMode = "single" | "split" | "overlap";

export interface MapCardSlice {
  /** 地図の表示モード（シングル, 分割, 重ねる） */
  viewMode: MapViewMode;
  setViewMode: (viewMode: MapViewMode) => void;
  /** 2つの地図の位置を連動するかどうか */
  isLinkMapPosition: boolean;
  setIsLinkMapPosition: (isLink: boolean) => void;
  /** 主マップの透過率(0-1) */
  primaryMapOpacity: number;
  setPrimaryMapOpacity: (opacity: number) => void;
}

export const createMapCardSlice: StateCreator<
  MapCardSlice,
  [],
  [],
  MapCardSlice
> = (set) => ({
  viewMode: "single",
  setViewMode: (viewMode: MapViewMode) => {
    set(() => ({ viewMode: viewMode }));
  },
  isLinkMapPosition: false,
  setIsLinkMapPosition: (isLink: boolean) => {
    set(() => ({ isLinkMapPosition: isLink }));
  },
  primaryMapOpacity: 0.5,
  setPrimaryMapOpacity: (opacity: number) => {
    set(() => ({ primaryMapOpacity: opacity }));
  },
});
