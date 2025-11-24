import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";

export type MapId = "main" | "sub";
export type LayoutMode = "single" | "split" | "overlay";

export interface MapManagerState {
  /** 表示中のMapID */
  activeMapIds: MapId[];
  /** 操作対象のMapId */
  focusMapId: MapId;
  setFocusMapId: (mapId: MapId) => void;
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
  GlobalState,
  [],
  [],
  MapManagerState
> = (set) => ({
  activeMapIds: ["main"],
  layoutMode: "single",
  focusMapId: "main",
  setFocusMapId: (mapId) => {
    set(() => {
      return { focusMapId: mapId };
    });
  },
  setLayoutMode: (mode) => {
    set(() => {
      if (mode === "single") {
        return {
          layoutMode: mode,
          activeMapIds: ["main"],
          focusMapId: "main",
          isSyncPosition: false,
        };
      } else if (mode === "split") {
        return {
          layoutMode: mode,
          activeMapIds: ["main", "sub"],
          focusMapId: "sub",
          isSyncPosition: true,
        };
      } else {
        return {
          layoutMode: mode,
          activeMapIds: ["main", "sub"],
          focusMapId: "sub",
          isSyncPosition: true,
        };
      }
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
