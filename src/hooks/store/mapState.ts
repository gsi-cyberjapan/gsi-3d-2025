import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";
import { MapId } from "./mapManagerState";
import { BaseLayer, getBaseLayers } from "@/lib/getBaseLayers";
import { TerraDraw } from "terra-draw";

export interface OptionalLayerEntry {
  layerId: string;
  title: string;
  opacity: number;
  visible: boolean;
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
  /** 陰影表示 */
  isHillshadeEnabled: boolean;
  /** 立体表示 */
  isTerrainEnabled: boolean;
  /** 点群表示 */
  isPointCloudEnabled: boolean;
}

export const MAP_INITIAL_STATE: MapState = {
  baseLayer: getBaseLayers()[0],
  optionalLayers: [],
  projection: "mercator",
  td: null,
  isHillshadeEnabled: false,
  isTerrainEnabled: false,
  isPointCloudEnabled: false,
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
  /** 陰影表示の切り替え */
  setHillshadeEnabled: ({
    mapId,
    enabled,
  }: {
    mapId: MapId;
    enabled: boolean;
  }) => void;
  /** 立体表示の切り替え */
  setTerrainEnabled: ({
    mapId,
    enabled,
  }: {
    mapId: MapId;
    enabled: boolean;
  }) => void;
  /** 点群表示の切り替え */
  setPointCloudEnabled: ({
    mapId,
    enabled,
  }: {
    mapId: MapId;
    enabled: boolean;
  }) => void;
  /** ハイドレーション */
  hydrateMapState: (partial: {
    mainBaseLayer?: BaseLayer;
    subBaseLayer?: BaseLayer;
    mainProjection?: Projection;
    subProjection?: Projection;
    mainOptionalLayers?: OptionalLayerEntry[];
    subOptionalLayers?: OptionalLayerEntry[];
    mainHillshade?: boolean;
    subHillshade?: boolean;
    mainTerrain?: boolean;
    subTerrain?: boolean;
    mainPointCloud?: boolean;
    subPointCloud?: boolean;
  }) => void;
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
  setHillshadeEnabled: ({ mapId, enabled }) => {
    set((state) => ({
      maps: {
        ...state.maps,
        [mapId]: {
          ...state.maps[mapId],
          isHillshadeEnabled: enabled,
        },
      },
    }));
  },
  setTerrainEnabled: ({ mapId, enabled }) => {
    set((state) => ({
      maps: {
        ...state.maps,
        [mapId]: {
          ...state.maps[mapId],
          isTerrainEnabled: enabled,
        },
      },
    }));
  },
  setPointCloudEnabled: ({ mapId, enabled }) => {
    set((state) => ({
      maps: {
        ...state.maps,
        [mapId]: {
          ...state.maps[mapId],
          isPointCloudEnabled: enabled,
        },
      },
    }));
  },
  hydrateMapState: (partial) => {
    set((state) => {
      const maps = { ...state.maps };
      if (
        partial.mainBaseLayer ||
        partial.mainProjection ||
        partial.mainOptionalLayers ||
        partial.mainHillshade !== undefined ||
        partial.mainTerrain !== undefined ||
        partial.mainPointCloud !== undefined
      ) {
        maps.main = {
          ...maps.main,
          ...(partial.mainBaseLayer && { baseLayer: partial.mainBaseLayer }),
          ...(partial.mainProjection && { projection: partial.mainProjection }),
          ...(partial.mainOptionalLayers && {
            optionalLayers: partial.mainOptionalLayers,
          }),
          ...(partial.mainHillshade !== undefined && {
            isHillshadeEnabled: partial.mainHillshade,
          }),
          ...(partial.mainTerrain !== undefined && {
            isTerrainEnabled: partial.mainTerrain,
          }),
          ...(partial.mainPointCloud !== undefined && {
            isPointCloudEnabled: partial.mainPointCloud,
          }),
        };
      }
      if (
        partial.subBaseLayer ||
        partial.subProjection ||
        partial.subOptionalLayers ||
        partial.subHillshade !== undefined ||
        partial.subTerrain !== undefined ||
        partial.subPointCloud !== undefined
      ) {
        maps.sub = {
          ...maps.sub,
          ...(partial.subBaseLayer && { baseLayer: partial.subBaseLayer }),
          ...(partial.subProjection && { projection: partial.subProjection }),
          ...(partial.subOptionalLayers && {
            optionalLayers: partial.subOptionalLayers,
          }),
          ...(partial.subHillshade !== undefined && {
            isHillshadeEnabled: partial.subHillshade,
          }),
          ...(partial.subTerrain !== undefined && {
            isTerrainEnabled: partial.subTerrain,
          }),
          ...(partial.subPointCloud !== undefined && {
            isPointCloudEnabled: partial.subPointCloud,
          }),
        };
      }
      return { maps };
    });
  },
});
