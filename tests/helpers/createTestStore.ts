import { create } from "zustand";
import {
  createMapManagerSlice,
  MapManagerState,
} from "@/hooks/store/mapManagerState";
import { createMapSlice, MapStateWrapper } from "@/hooks/store/mapState";
import { createDrawSlice, DrawState } from "@/hooks/store/drawState";
import {
  createGeocodingSlice,
  GeocodingState,
} from "@/hooks/store/geocodingState";
import { createMeasureSlice, MeasureState } from "@/hooks/store/measureState";
import {
  createZoomGuideSlice,
  ZoomGuideState,
} from "@/hooks/store/zoomGuideState";
import { createReliefSlice, ReliefState } from "@/hooks/store/reliefState";
import { createGridSlice, GridState } from "@/hooks/store/gridState";
import {
  createSaveImageSlice,
  SaveImageState,
} from "@/hooks/store/saveImageState";
import { createPrintSlice, PrintState } from "@/hooks/store/printState";
import { createShareSlice, ShareState } from "@/hooks/store/shareState";
import {
  createEquidistantCirclesSlice,
  EquidistantCirclesState,
} from "@/hooks/store/equidistantCirclesState";
import { createAzimuthSlice, AzimuthState } from "@/hooks/store/azimuthState";
import {
  createFeaturePopupSlice,
  FeaturePopupState,
} from "@/hooks/store/featurePopupState";

type GlobalState = MapManagerState &
  MapStateWrapper &
  DrawState &
  GeocodingState &
  MeasureState &
  ZoomGuideState &
  ReliefState &
  GridState &
  SaveImageState &
  PrintState &
  ShareState &
  EquidistantCirclesState &
  AzimuthState &
  FeaturePopupState;

export const createTestStore = () =>
  create<GlobalState>((...args) => ({
    ...createMapManagerSlice(...args),
    ...createMapSlice(...args),
    ...createDrawSlice(...args),
    ...createGeocodingSlice(...args),
    ...createMeasureSlice(...args),
    ...createZoomGuideSlice(...args),
    ...createReliefSlice(...args),
    ...createGridSlice(...args),
    ...createSaveImageSlice(...args),
    ...createPrintSlice(...args),
    ...createShareSlice(...args),
    ...createEquidistantCirclesSlice(...args),
    ...createAzimuthSlice(...args),
    ...createFeaturePopupSlice(...args),
  }));
