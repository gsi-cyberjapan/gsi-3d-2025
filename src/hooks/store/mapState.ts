import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";
import { MapId } from "./mapManagerState";
import { BaseLayer, getBaseLayers } from "@/lib/getBaseLayers";
import { TerraDraw } from "terra-draw";

interface OptionalLayerEntry {
  layerId: string;
  title: string;
  opacity: number;
  tileUrl: string;
  minZoom?: number;
  maxZoom?: number;
}

type Projection = "mercator" | "globe";

export interface MapState {
  /** ベースとなるレイヤー */
  baseLayer: BaseLayer;
  /** オプションレイヤー */
  optionalLayers: OptionalLayerEntry[];
  /** 投影モード */
  projection: Projection;
  /** TerraDrawのインスタンス */
  td: TerraDraw | null;
}

export const MAP_INITIAL_STATE: MapState = {
  baseLayer: getBaseLayers()[0],
  optionalLayers: [],
  projection: "mercator",
  td: null,
};

export interface MapStateWrapper {
  /** マップの状態 */
  maps: Record<MapId, MapState>;
  /** ベースレイヤーの切り替え */
  setBaseLayer: ({
    mapId,
    baseLayer,
  }: {
    mapId: MapId;
    baseLayer: BaseLayer;
  }) => void;
  /** オプションレイヤーの変更 */
  setOptionalLayer: ({
    mapId,
    layers,
  }: {
    mapId: MapId;
    layers: OptionalLayerEntry[];
  }) => void;
  /** 投影モードの切り替え */
  setProjection: ({ mapId, mode }: { mapId: MapId; mode: Projection }) => void;
  /** TerraDrawインスタンスのセット */
  setTerraDraw: ({ mapId, td }: { mapId: MapId; td: TerraDraw }) => void;
}

export const createMapSlice: StateCreator<
  GlobalState,
  [],
  [],
  MapStateWrapper
> = (set, get) => ({
  maps: {
    main: MAP_INITIAL_STATE,
    sub: MAP_INITIAL_STATE,
  },
  setBaseLayer: ({ mapId, baseLayer }) => {
    set((state) => {
      return {
        maps: {
          ...state.maps,
          [mapId]: {
            ...state.maps[mapId],
            baseLayer: baseLayer,
          },
        },
      };
    });
  },
  setOptionalLayer: ({ mapId, layers }) => {
    set((state) => {
      return {
        maps: {
          ...state.maps,
          [mapId]: {
            ...state.maps[mapId],
            optionalLayers: layers,
          },
        },
      };
    });
  },
  setProjection: ({ mapId, mode }) => {
    set((state) => {
      return {
        maps: {
          ...state.maps,
          [mapId]: {
            ...state.maps[mapId],
            projection: mode,
          },
        },
      };
    });
  },
  setTerraDraw: ({ mapId, td }) => {
    const current = get().maps[mapId].td;
    if (current) {
      return;
    }
    set((state) => {
      return {
        maps: {
          ...state.maps,
          [mapId]: {
            ...state.maps[mapId],
            td,
          },
        },
      };
    });
  },
});
