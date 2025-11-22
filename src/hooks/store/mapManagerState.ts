import { StateCreator } from "zustand";

export type MapId = "main" | "sub";
export type LayoutMode = "single" | "split" | "overlay";

export interface MapManagerState {
  /** 表示中のMapId */
  activeMapIds: MapId[];
  /** 操作対象のMapId */
  focusMapId: MapId;
  /** マップの表示レイアウト */
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  /** 分割表示の時に位置を連動するかどうか */
  isSyncPosition: boolean;
  setIsSyncPosition: (value: boolean) => void;
  /** サブマップの透過度 */
  subMapOpacityOnOverlay: number;
  setSubMapOpacityOnOverlay: (value: number) => void;
}

export const createMapManagerSlice: StateCreator<
  MapManagerState,
  [],
  [],
  MapManagerState
> = (set) => ({
  activeMapIds: ["main"],
  layoutMode: "single",
  focusMapId: "main",
  setLayoutMode: (mode) => {
    set(() => {
      let activeMapIds: MapId[];
      if (mode === "single") {
        activeMapIds = ["main"];
      } else {
        activeMapIds = ["main", "sub"];
      }
      return {
        layoutMode: mode,
        activeMapIds,
        focusMapId: activeMapIds[0],
      };
    });
  },
  isSyncPosition: false,
  setIsSyncPosition: (value) => {
    set(() => {
      return {
        isSyncPosition: value,
      };
    });
  },
  subMapOpacityOnOverlay: 0.5,
  setSubMapOpacityOnOverlay: (value) => {
    set(() => {
      return {
        subMapOpacityOnOverlay: value,
      };
    });
  },
});
