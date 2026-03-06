import { StateCreator } from "zustand";
import { GlobalState } from "./useStore";
import { MapId } from "./mapManagerState";
import { type SaveImageBBox } from "@/lib/saveImage";

export interface SaveImageState {
  /** Whether the save image window is open */
  isSaveImageWindowOpen: boolean;
  setIsSaveImageWindowOpen: (value: boolean) => void;
  /** The bounding box for image capture */
  saveImageBBox: SaveImageBBox | null;
  setSaveImageBBox: (bbox: SaveImageBBox | null) => void;
  /** Whether bbox selection mode is active */
  isSaveImageBBoxMode: boolean;
  setIsSaveImageBBoxMode: (value: boolean) => void;
  /** Target map for bbox overlay */
  saveImageTargetMapId: MapId;
  setSaveImageTargetMapId: (mapId: MapId) => void;
}

export const createSaveImageSlice: StateCreator<
  GlobalState,
  [],
  [],
  SaveImageState
> = (set) => ({
  isSaveImageWindowOpen: false,
  setIsSaveImageWindowOpen: (value) => {
    set(() => {
      if (value) {
        return { isSaveImageWindowOpen: true };
      }
      return {
        isSaveImageWindowOpen: false,
        saveImageBBox: null,
        isSaveImageBBoxMode: false,
      };
    });
  },
  saveImageBBox: null,
  setSaveImageBBox: (bbox) => {
    set(() => ({ saveImageBBox: bbox }));
  },
  isSaveImageBBoxMode: false,
  setIsSaveImageBBoxMode: (value) => {
    set(() => ({ isSaveImageBBoxMode: value }));
  },
  saveImageTargetMapId: "main",
  setSaveImageTargetMapId: (mapId) => {
    set(() => ({ saveImageTargetMapId: mapId }));
  },
});
