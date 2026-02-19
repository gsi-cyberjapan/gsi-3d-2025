import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";

export type MapId = "main" | "sub";
export type LayoutMode = "single" | "split" | "overlay";
export type FooterDisplayMode = "closed" | "full";

export interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

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
  /** 中心の十字線を表示するかどうか */
  isDisplayCenterLine: boolean;
  setIsDisaplayCenterLine: (value: boolean) => void;
  /** 広域図を表示するかどうか */
  isDisplayOverview: boolean;
  setIsDisplayOverview: (value: boolean) => void;
  /** クリックで移動するかどうか */
  isClickToMoveEnabled: boolean;
  setIsClickToMoveEnabled: (value: boolean) => void;
  /** 各マップのビューステート */
  viewStates: Record<MapId, ViewState | null>;
  setViewState: (mapId: MapId, viewState: ViewState) => void;
  /** 磁北線を表示するかどうか */
  isDisplayMagneticNorth: boolean;
  setIsDisplayMagneticNorth: (value: boolean) => void;
  /** フッターの表示モード */
  footerDisplayMode: FooterDisplayMode;
  setFooterDisplayMode: (mode: FooterDisplayMode) => void;
  /** ハイドレーション完了フラグ */
  isHydrated: boolean;
  /** ハイドレーション */
  hydrateMapManagerState: (partial: {
    layoutMode?: LayoutMode;
    isSyncPosition?: boolean;
    subMapOpacityOnOverlay?: number;
    isDisplayCenterLine?: boolean;
    isDisplayOverview?: boolean;
    isClickToMoveEnabled?: boolean;
    isDisplayMagneticNorth?: boolean;
    footerDisplayMode?: FooterDisplayMode;
    mainViewState?: ViewState;
    subViewState?: ViewState;
  }) => void;
  /** ハイドレーション完了をセット */
  setIsHydrated: (value: boolean) => void;
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
  isDisplayCenterLine: true,
  setIsDisaplayCenterLine: (value) => {
    set(() => {
      return {
        isDisplayCenterLine: value,
      };
    });
  },
  isDisplayOverview: false,
  setIsDisplayOverview: (value) => {
    set(() => {
      return {
        isDisplayOverview: value,
      };
    });
  },
  isClickToMoveEnabled: false,
  setIsClickToMoveEnabled: (value) => {
    set(() => {
      return {
        isClickToMoveEnabled: value,
      };
    });
  },
  viewStates: { main: null, sub: null },
  setViewState: (mapId, viewState) => {
    set((state) => ({
      viewStates: { ...state.viewStates, [mapId]: viewState },
    }));
  },
  isDisplayMagneticNorth: false,
  setIsDisplayMagneticNorth: (value) => {
    set(() => ({
      isDisplayMagneticNorth: value,
    }));
  },
  footerDisplayMode: "full",
  setFooterDisplayMode: (mode) => {
    set(() => ({
      footerDisplayMode: mode,
    }));
  },
  isHydrated: false,
  hydrateMapManagerState: (partial) => {
    set((state) => {
      const updates: Partial<MapManagerState> = {};

      if (partial.layoutMode !== undefined) {
        updates.layoutMode = partial.layoutMode;
        if (partial.layoutMode === "single") {
          updates.activeMapIds = ["main"];
          updates.focusMapId = "main";
        } else {
          updates.activeMapIds = ["main", "sub"];
          updates.focusMapId = "sub";
        }
      }
      if (partial.isSyncPosition !== undefined) {
        updates.isSyncPosition = partial.isSyncPosition;
      }
      if (partial.subMapOpacityOnOverlay !== undefined) {
        updates.subMapOpacityOnOverlay = partial.subMapOpacityOnOverlay;
      }
      if (partial.isDisplayCenterLine !== undefined) {
        updates.isDisplayCenterLine = partial.isDisplayCenterLine;
      }
      if (partial.isDisplayOverview !== undefined) {
        updates.isDisplayOverview = partial.isDisplayOverview;
      }
      if (partial.isClickToMoveEnabled !== undefined) {
        updates.isClickToMoveEnabled = partial.isClickToMoveEnabled;
      }
      if (partial.isDisplayMagneticNorth !== undefined) {
        updates.isDisplayMagneticNorth = partial.isDisplayMagneticNorth;
      }
      if (partial.footerDisplayMode !== undefined) {
        updates.footerDisplayMode = partial.footerDisplayMode;
      }

      const viewStates = { ...state.viewStates };
      if (partial.mainViewState !== undefined) {
        viewStates.main = partial.mainViewState;
      }
      if (partial.subViewState !== undefined) {
        viewStates.sub = partial.subViewState;
      }
      updates.viewStates = viewStates;

      return updates;
    });
  },
  setIsHydrated: (value) => {
    set(() => ({ isHydrated: value }));
  },
});
