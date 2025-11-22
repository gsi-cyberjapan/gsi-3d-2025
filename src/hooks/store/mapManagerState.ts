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
  /** レイアウトを切り替える関数 */
  setLayoutMode: (mode: LayoutMode) => void;
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
});
