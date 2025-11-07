import { StateCreator } from "zustand";
import { MAP_CONFIG } from "@/lib/config";
import { MapInitialViewState } from "@/components/custom/map-card/map";

type MapViewMode = "single" | "split" | "overlap";
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
  /** 主マップの透過率(0-1) */
  primaryMapOpacity: number;
  setPrimaryMapOpacity: (opacity: number) => void;
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
      if (setOption.viewMode === "split" || setOption.viewMode === "overlap") {
        return {
          mapMetas: [
            mapAMeta,
            {
              id: MAP_CONFIG.MAP_B.ID,
              mapName: MAP_CONFIG.MAP_B.NAME,
              initialViewState: setOption.newMapnitialViewState,
            },
          ],
        };
      }

      return { mapMetas: [mapAMeta] };
    });
  },
  mapMetas: [
    {
      id: MAP_CONFIG.MAP_A.ID,
      mapName: MAP_CONFIG.MAP_A.NAME,
      initialViewState: {
        longitue: MAP_CONFIG.INITALI_VIEW_STATE.LONGITUDE,
        latitude: MAP_CONFIG.INITALI_VIEW_STATE.LATITUDE,
        zoom: MAP_CONFIG.INITALI_VIEW_STATE.ZOOM,
      },
    },
  ],
  isLinkMapPosition: false,
  setIsLinkMapPosition: (isLink: boolean) => {
    set(() => ({ isLinkMapPosition: isLink }));
  },
  primaryMapOpacity: 0.5,
  setPrimaryMapOpacity: (opacity: number) => {
    set(() => ({ primaryMapOpacity: opacity }));
  },
});
