import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";
import { MapId } from "./mapManagerState";
import { MARKER_ICON_CONFIG } from "@/lib/config";

export type DrawMode =
  | "point"
  | "linestring"
  | "freehand-linestring"
  | "polygon"
  | "text"
  | "circle"
  | "select";

const DRAW_MODES = [
  "point",
  "linestring",
  "freehand-linestring",
  "polygon",
  "text",
  "circle",
  "select",
] as const satisfies readonly DrawMode[];

export const isDrawMode = (v: string): v is DrawMode => {
  return (DRAW_MODES as readonly string[]).includes(v);
};

export type FeatureId = string | number;
export type EditingFeature = { featureId: FeatureId; mapId: MapId };

export interface DrawState {
  /** 作図ウィンドウが表示中かどうか */
  isDrawWindowOpen: boolean;
  setIsDrawWindowOpen: (value: boolean) => void;
  /** 作図モード */
  drawMode: DrawMode;
  setDrawMode: (mode: DrawMode) => void;
  /** 編集対象のFeatureID */
  editingFeature: EditingFeature | undefined;
  setEditingFeature: (feature: EditingFeature | undefined) => void;
  /** 非表示のソースキー（"main:terradraw", "sub:sample.geojson"など） */
  hiddenSources: Set<string>;
  toggleSourceVisibility: (sourceKey: string) => void;
  /** 選択中のマーカーシンボル */
  selectedMarkerSymbol: string;
  setSelectedMarkerSymbol: (symbol: string) => void;
}

export const createDrawSlice: StateCreator<GlobalState, [], [], DrawState> = (
  set,
) => ({
  isDrawWindowOpen: false,
  setIsDrawWindowOpen: (value) => {
    set(() => {
      return {
        isDrawWindowOpen: value,
      };
    });
  },
  drawMode: "circle",
  setDrawMode: (mode) => {
    set(() => {
      return {
        drawMode: mode,
      };
    });
  },
  editingFeature: undefined,
  setEditingFeature: (feature) => {
    set(() => {
      return {
        editingFeature: feature,
      };
    });
  },
  hiddenSources: new Set<string>(),
  toggleSourceVisibility: (sourceKey) => {
    set((state) => {
      const newHiddenSources = new Set(state.hiddenSources);
      if (newHiddenSources.has(sourceKey)) {
        newHiddenSources.delete(sourceKey);
      } else {
        newHiddenSources.add(sourceKey);
      }
      return {
        hiddenSources: newHiddenSources,
      };
    });
  },
  selectedMarkerSymbol: MARKER_ICON_CONFIG.DEFAULT_ICON,
  setSelectedMarkerSymbol: (symbol) => {
    set(() => {
      return {
        selectedMarkerSymbol: symbol,
      };
    });
  },
});
