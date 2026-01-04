import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";

export type DrawMode =
  | "marker"
  | "line"
  | "freehand"
  | "polygon"
  | "text"
  | "circle"
  | "select";

const DRAW_MODES = [
  "marker",
  "line",
  "freehand",
  "polygon",
  "text",
  "circle",
  "select",
] as const satisfies readonly DrawMode[];

export const isDrawMode = (v: string): v is DrawMode => {
  return (DRAW_MODES as readonly string[]).includes(v);
};

export interface DrawState {
  /** 作図ウィンドウが表示中かどうか */
  isDrawWindowOpen: boolean;
  setIsDrawWindowOpen: (value: boolean) => void;
  /** 作図モード */
  drawMode: DrawMode;
  setDrawMode: (mode: DrawMode) => void;
}

export const createDrawSlice: StateCreator<GlobalState, [], [], DrawState> = (
  set,
) => ({
  isDrawWindowOpen: false,
  setIsDrawWindowOpen: (value) => {
    set(() => {
      return {
        isDrawWindowOpen: value,
      };
    });
  },
  drawMode: "marker",
  setDrawMode: (mode) => {
    set(() => {
      return {
        drawMode: mode,
      };
    });
  },
});
