import { create } from "zustand";
import {
  createMapManagerSlice,
  MapManagerState,
  MapId,
} from "./mapManagerState";
import { createMapSlice, MapStateWrapper, MAP_INITIAL_STATE } from "./mapState";
import { createDrawSlice, DrawState } from "./drawState";
import { createGeocodingSlice, GeocodingState } from "./geocodingState";
import { createMeasureSlice, MeasureState } from "./measureState";
import { createZoomGuideSlice, ZoomGuideState } from "./zoomGuideState";
import { createReliefSlice, ReliefState } from "./reliefState";
import { createGridSlice, GridState } from "./gridState";
import { DRAW_CONFIG } from "@/lib/config";
import {
  DEFAULT_PATTERN_ID,
  getDefaultRanges,
} from "@/lib/relief/colorPatterns";
import { writeHashState, writeCookieState } from "@/lib/statePersistence";

interface ResetState {
  resetTrigger: number;
  resetAllState: () => void;
}

export type GlobalState = MapManagerState &
  MapStateWrapper &
  DrawState &
  GeocodingState &
  MeasureState &
  ZoomGuideState &
  ReliefState &
  GridState &
  ResetState;
export const useStore = create<GlobalState>((...args) => {
  const [set, get] = args;
  return {
    ...createMapManagerSlice(...args),
    ...createMapSlice(...args),
    ...createDrawSlice(...args),
    ...createGeocodingSlice(...args),
    ...createMeasureSlice(...args),
    ...createZoomGuideSlice(...args),
    ...createReliefSlice(...args),
    ...createGridSlice(...args),
    resetTrigger: 0,
    resetAllState: () => {
      const state = get();

      // TerraDraw のフィーチャーをすべて削除（インスタンスは保持）
      const mapIds: MapId[] = ["main", "sub"];
      for (const mapId of mapIds) {
        const td = state.maps[mapId].td;
        if (td) {
          try {
            const features = td.getSnapshot();
            if (features.length > 0) {
              td.removeFeatures(features.map((f) => f.id as string | number));
            }
            td.setMode("static");
          } catch {
            // TerraDraw が非アクティブな場合は無視
          }
        }
      }

      // 全スライスのデータ状態を初期値にリセット
      set({
        // mapManagerState
        layoutMode: "single",
        activeMapIds: ["main"],
        focusMapId: "main",
        isSyncPosition: false,
        subMapOpacityOnOverlay: 0.5,
        isDisplayCenterLine: true,
        isDisplayOverview: false,
        isClickToMoveEnabled: false,
        viewStates: { main: null, sub: null },
        isDisplayMagneticNorth: false,
        // isHydrated は true のまま維持

        // mapState（td は保持）
        maps: {
          main: { ...MAP_INITIAL_STATE, td: state.maps.main.td },
          sub: { ...MAP_INITIAL_STATE, td: state.maps.sub.td },
        },

        // drawState
        isDrawWindowOpen: false,
        drawMode: "circle",
        editingFeature: undefined,
        hiddenSources: new Set<string>(),
        selectedMarkerSymbol: DRAW_CONFIG.MARKER.DEFAULT_ICON,
        selectedFeature: null,
        draggingPosition: null,

        // geocodingState
        resultLngLat: null,
        addressSearchResult: null,
        isAddressSearchLoading: false,
        isAddressSearchSuggestOpen: false,
        hoveringAddressSearchSuggestId: null,
        selectedAddrssCandidate: null,

        // measureState
        isMeasureWindowOpen: false,
        measureMode: "distance",
        currentMeasurement: null,

        // gridState
        isDisplayLatLngGrid: false,
        isDisplayUtmGrid: false,
        isDisplayTileGrid: false,
        isDisplayRegionalMesh: false,
        isDisplayMapSheetNumbers: false,

        // reliefState
        isReliefWindowOpen: false,
        elevationRanges: getDefaultRanges(),
        isHillshadeEnabled: false,
        selectedPatternId: DEFAULT_PATTERN_ID,

        // resetTrigger
        resetTrigger: state.resetTrigger + 1,
      });

      // URL/Cookie をクリア
      writeHashState("");
      writeCookieState("");
    },
  };
});
