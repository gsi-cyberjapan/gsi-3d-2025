import { MapBaseData } from "@/lib/getMapBaseDataList";
import { StateCreator } from "zustand";
import { MapId } from "./createMapCardSlice";

export interface MapState {
  /** ベースレイヤー */
  mapBaseData: MapBaseData;
}

export interface MapSlice {
  /** mapId ごとの状態 */
  maps: Partial<Record<MapId, MapState>>;
  /** 初期化関数 */
  initMaps: (initialState: Record<MapId, MapState>) => void;
  /** ベースレイヤーを切り替える関数 */
  setBaseMapData: (mapId: MapId, mapBaseData: MapBaseData) => void;
}

export const createMapSlice: StateCreator<MapSlice, [], [], MapSlice> = (
  set,
) => ({
  maps: {},
  initMaps: (initialState) => {
    set({ maps: initialState });
  },
  setBaseMapData: (mapId, mapBaseData) => {
    set((state) => ({
      maps: {
        ...state.maps,
        [mapId]: {
          ...(state.maps[mapId] ?? {}),
          mapBaseData,
        },
      },
    }));
  },
});
