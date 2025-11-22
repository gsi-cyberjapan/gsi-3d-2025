import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";
import { MapId } from "./mapManagerState";
import { BaseLayer, getBaseLayers } from "@/lib/getBaseLayers";

export interface MapState {
  /** ベースとなるレイヤー */
  baseLayer: BaseLayer;
}

export const MAP_INITIAL_STATE: MapState = {
  baseLayer: getBaseLayers()[0],
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
            baseLayer: baseLayer,
          },
        },
      };
    });
  },
});
