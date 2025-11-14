import { BaseMapData } from "@/lib/getBaseMapList";
import { StateCreator } from "zustand";
import { MAP_CONFIG } from "@/lib/config";

type MapId =
  | typeof MAP_CONFIG.MAP_PRIMARY.ID
  | typeof MAP_CONFIG.MAP_SECONDARY.ID;

interface SingleMapState {
  /** ベースレイヤー */
  baseMapData: BaseMapData;
}

export interface MapSlice {
  /** mapId ごとの状態 */
  maps: Partial<Record<MapId, SingleMapState>>;
  /** 初期化関数 */
  initMaps: (initialState: Record<MapId, SingleMapState>) => void;
  /** ベースレイヤーを切り替える関数 */
  setBaseMapData: (mapId: MapId, baseMapData: BaseMapData) => void;
}

export const createMapSlice: StateCreator<MapSlice, [], [], MapSlice> = (
  set,
) => ({
  maps: {},
  initMaps: (initialState) => {
    set({ maps: initialState });
  },
  setBaseMapData: (mapId, baseMapData) => {
    set((state) => ({
      maps: {
        ...state.maps,
        [mapId]: {
          ...(state.maps[mapId] ?? {}),
          baseMapData,
        },
      },
    }));
  },
});
