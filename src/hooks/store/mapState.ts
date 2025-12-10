import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";
import { MapId } from "./mapManagerState";
import { BaseLayer, getBaseLayers } from "@/lib/getBaseLayers";

interface OptionalLayerEntry {
  layerId: string;
  title: string;
  opacity: number;
  tileUrl: string;
  minZoom?: number;
  maxZoom?: number;
}

export interface MapState {
  /** ベースとなるレイヤー */
  baseLayer: BaseLayer;
  /** オプションレイヤー */
  optionalLayers: OptionalLayerEntry[];
}

export const MAP_INITIAL_STATE: MapState = {
  baseLayer: getBaseLayers()[0],
  optionalLayers: [],
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
}

export const createMapSlice: StateCreator<
  GlobalState,
  [],
  [],
  MapStateWrapper
> = (set) => ({
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
});
