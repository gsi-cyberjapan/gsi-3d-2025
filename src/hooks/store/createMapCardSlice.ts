import { StateCreator } from "zustand";
import { MAP_CONFIG } from "@/lib/config";
import { MapInitialViewState } from "@/components/custom/map-card/map";

export const MAP_VIEW_MODES = ["single", "split", "overlap"] as const;
export type MapViewMode = (typeof MAP_VIEW_MODES)[number];
type SetMapViewModeOption =
  | {
      viewMode: "single";
    }
  | {
      viewMode: "split" | "overlap";
      newMapnitialViewState: MapInitialViewState;
    };

interface MapMeta {
  id: string;
  mapName: string;
  initialViewState: MapInitialViewState;
}

export interface MapCardSlice {
  /** 地図の表示モード（シングル, 分割, 重ねる） */
  viewMode: MapViewMode;
  setViewMode: (setOption: SetMapViewModeOption) => void;
  /** カード内の地図の情報 */
  mapMetas: MapMeta[];
  /** 2つの地図の位置を連動するかどうか */
  isLinkMapPosition: boolean;
  setIsLinkMapPosition: (isLink: boolean) => void;
  /** サブマップの透過率(0-1) */
  subMapOpacity: number;
  setSubMapOpacity: (opacity: number) => void;
}

export const createMapCardSlice: StateCreator<
  MapCardSlice,
  [],
  [],
  MapCardSlice
> = (set, get) => ({
  viewMode: "single",
  setViewMode: (setOption: SetMapViewModeOption) => {
    set(() => {
      const mapAMeta = get().mapMetas[0];
      if (setOption.viewMode === "split") {
        return {
          viewMode: setOption.viewMode,
          mapMetas: [
            mapAMeta,
            {
              id: MAP_CONFIG.MAP_SECONDARY.ID,
              mapName: MAP_CONFIG.MAP_SECONDARY.NAME,
              initialViewState: setOption.newMapnitialViewState,
            },
          ],
        };
      }
      if (setOption.viewMode === "overlap") {
        return {
          viewMode: setOption.viewMode,
          isLinkMapPosition: true,
          mapMetas: [
            mapAMeta,
            {
              id: MAP_CONFIG.MAP_SECONDARY.ID,
              mapName: MAP_CONFIG.MAP_SECONDARY.NAME,
              initialViewState: setOption.newMapnitialViewState,
            },
          ],
        };
      }

      return { viewMode: setOption.viewMode, mapMetas: [mapAMeta] };
    });
  },
  mapMetas: [
    {
      id: MAP_CONFIG.MAP_PRIMARY.ID,
      mapName: MAP_CONFIG.MAP_PRIMARY.NAME,
      initialViewState: {
        longitude: MAP_CONFIG.INITIAL_VIEW_STATE.LONGITUDE,
        latitude: MAP_CONFIG.INITIAL_VIEW_STATE.LATITUDE,
        zoom: MAP_CONFIG.INITIAL_VIEW_STATE.ZOOM,
      },
    },
  ],
  isLinkMapPosition: false,
  setIsLinkMapPosition: (isLink: boolean) => {
    set(() => ({ isLinkMapPosition: isLink }));
  },
  subMapOpacity: MAP_CONFIG.INITIAL_OVERLAP_MAP_OPACITY,
  setSubMapOpacity: (opacity: number) => {
    set(() => ({ subMapOpacity: opacity }));
  },
});
