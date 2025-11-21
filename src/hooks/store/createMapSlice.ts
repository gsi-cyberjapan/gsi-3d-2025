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
  /** 単一の地図を初期化する関数 */
  initMap: (mapId: MapId, initialState: MapState) => void;
  /** ベースレイヤーを切り替える関数 */
  setBaseMapData: (mapId: MapId, mapBaseData: MapBaseData) => void;
}

export const createMapSlice: StateCreator<MapSlice, [], [], MapSlice> = (
  set,
) => ({
  maps: {},
  initMap: (mapId, initialState) => {
    set((state) => ({
      maps: {
        ...state.maps,
        // 既存の状態があれば保持し、なければ初期状態を使用
        [mapId]: state.maps[mapId] ?? initialState,
      },
    }));
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
