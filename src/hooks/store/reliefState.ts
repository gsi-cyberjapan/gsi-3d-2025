import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";
import {
  ElevationRange,
  DEFAULT_PATTERN_ID,
  getDefaultRanges,
  getPatternById,
  generateRangeId,
} from "@/lib/relief/colorPatterns";
import { DemSourceId, DEFAULT_DEM_SOURCE_ID } from "@/lib/config";

export interface ReliefState {
  /** 段彩図設定ウィンドウの表示状態 */
  isReliefWindowOpen: boolean;
  /** 段彩図設定ウィンドウの表示状態を設定 */
  setIsReliefWindowOpen: (value: boolean) => void;
  /** 標高レンジの配列 */
  elevationRanges: ElevationRange[];
  /** 標高レンジを設定 */
  setElevationRanges: (ranges: ElevationRange[]) => void;
  /** 標高レンジを追加 */
  addElevationRange: () => void;
  /** 標高レンジを削除 */
  removeElevationRange: (id: string) => void;
  /** 標高レンジを更新 */
  updateElevationRange: (
    id: string,
    updates: Partial<Omit<ElevationRange, "id">>,
  ) => void;
  /** 陰影の有効状態 */
  isHillshadeEnabled: boolean;
  /** 陰影を設定 */
  setIsHillshadeEnabled: (value: boolean) => void;
  /** 選択中のカラーパターンID */
  selectedPatternId: string;
  /** カラーパターンを適用 */
  applyColorPattern: (patternId: string) => void;
  /** 選択中のDEMソースID */
  selectedDemSourceId: DemSourceId;
  /** DEMソースを設定 */
  setSelectedDemSourceId: (id: DemSourceId) => void;
  /** デフォルトにリセット */
  resetToDefaults: () => void;
  /** ハイドレーション */
  hydrateReliefState: (partial: {
    isReliefWindowOpen?: boolean;
    isHillshadeEnabled?: boolean;
    selectedPatternId?: string;
    elevationRanges?: ElevationRange[];
    selectedDemSourceId?: DemSourceId;
  }) => void;
}

export const createReliefSlice: StateCreator<
  GlobalState,
  [],
  [],
  ReliefState
> = (set) => ({
  isReliefWindowOpen: false,
  setIsReliefWindowOpen: (value) => {
    set(() => ({
      isReliefWindowOpen: value,
    }));
  },

  elevationRanges: getDefaultRanges(),
  setElevationRanges: (ranges) => {
    set(() => ({
      elevationRanges: ranges,
    }));
  },

  addElevationRange: () => {
    set((state) => {
      const sortedRanges = [...state.elevationRanges].sort(
        (a, b) => a.minElevation - b.minElevation,
      );
      const lowestElevation = sortedRanges[0]?.minElevation ?? 0;
      const newElevation = Math.max(0, lowestElevation - 5);

      return {
        elevationRanges: [
          ...state.elevationRanges,
          {
            id: generateRangeId(),
            minElevation: newElevation,
            color: "#808080",
          },
        ],
        selectedPatternId: "", // Clear pattern selection when manually editing
      };
    });
  },

  removeElevationRange: (id) => {
    set((state) => {
      // Minimum 2 ranges required
      if (state.elevationRanges.length <= 2) {
        return state;
      }
      return {
        elevationRanges: state.elevationRanges.filter(
          (range) => range.id !== id,
        ),
        selectedPatternId: "", // Clear pattern selection when manually editing
      };
    });
  },

  updateElevationRange: (id, updates) => {
    set((state) => {
      const updatedRanges = state.elevationRanges.map((range) =>
        range.id === id ? { ...range, ...updates } : range,
      );
      // Sort by minElevation ascending after update
      const sortedRanges = updatedRanges.sort(
        (a, b) => a.minElevation - b.minElevation,
      );
      return {
        elevationRanges: sortedRanges,
        selectedPatternId: "", // Clear pattern selection when manually editing
      };
    });
  },

  isHillshadeEnabled: false,
  setIsHillshadeEnabled: (value) => {
    set(() => ({
      isHillshadeEnabled: value,
    }));
  },

  selectedPatternId: DEFAULT_PATTERN_ID,
  applyColorPattern: (patternId) => {
    set(() => {
      const pattern = getPatternById(patternId);
      if (!pattern) {
        return {};
      }

      const newRanges = pattern.ranges.map((range, index) => ({
        ...range,
        id: `pattern-${patternId}-${String(index)}`,
      }));

      return {
        selectedPatternId: patternId,
        elevationRanges: newRanges,
      };
    });
  },

  selectedDemSourceId: DEFAULT_DEM_SOURCE_ID,
  setSelectedDemSourceId: (id) => {
    set(() => ({
      selectedDemSourceId: id,
    }));
  },

  resetToDefaults: () => {
    set(() => ({
      elevationRanges: getDefaultRanges(),
      selectedPatternId: DEFAULT_PATTERN_ID,
      isHillshadeEnabled: false,
    }));
  },
  hydrateReliefState: (partial) => {
    set(() => {
      const updates: Partial<ReliefState> = {};
      if (partial.isReliefWindowOpen !== undefined)
        updates.isReliefWindowOpen = partial.isReliefWindowOpen;
      if (partial.isHillshadeEnabled !== undefined)
        updates.isHillshadeEnabled = partial.isHillshadeEnabled;
      if (partial.selectedPatternId !== undefined)
        updates.selectedPatternId = partial.selectedPatternId;
      if (partial.elevationRanges !== undefined)
        updates.elevationRanges = partial.elevationRanges;
      if (partial.selectedDemSourceId !== undefined)
        updates.selectedDemSourceId = partial.selectedDemSourceId;
      return updates;
    });
  },
});
