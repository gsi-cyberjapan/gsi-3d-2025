import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";
import {
  ElevationRange,
  DEFAULT_PATTERN_ID,
  getDefaultRanges,
  getPatternById,
  generateRangeId,
} from "@/lib/relief/colorPatterns";

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
  /** デフォルトにリセット */
  resetToDefaults: () => void;
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

  resetToDefaults: () => {
    set(() => ({
      elevationRanges: getDefaultRanges(),
      selectedPatternId: DEFAULT_PATTERN_ID,
      isHillshadeEnabled: false,
    }));
  },
});
