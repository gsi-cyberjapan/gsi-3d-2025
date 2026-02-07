"use client";

import { useStore } from "@/hooks/store/useStore";
import { readPersistedState } from "@/lib/statePersistence";
import { resolveBaseLayer } from "@/lib/stateSerializer";
import { OptionalLayerEntry } from "@/hooks/store/mapState";

let hydrationDone = false;

const hydrateStore = () => {
  const state = readPersistedState();
  const store = useStore.getState();

  // Hydrate map manager state
  store.hydrateMapManagerState({
    layoutMode: state.layoutMode,
    isSyncPosition: state.isSyncPosition,
    subMapOpacityOnOverlay: state.subMapOpacityOnOverlay,
    isDisplayCenterLine: state.isDisplayCenterLine,
    isDisplayOverview: state.isDisplayOverview,
    isClickToMoveEnabled: state.isClickToMoveEnabled,
    isDisplayMagneticNorth: state.isDisplayMagneticNorth,
    mainViewState: state.mainViewState,
    subViewState: state.subViewState,
  });

  // Hydrate map state (base layers, projections, optional layers)
  const mainBaseLayer = state.mainBaseLayerId
    ? resolveBaseLayer(state.mainBaseLayerId)
    : undefined;
  const subBaseLayer = state.subBaseLayerId
    ? resolveBaseLayer(state.subBaseLayerId)
    : undefined;

  const toOptionalLayers = (
    serialized?: {
      layerId: string;
      title: string;
      opacity: number;
      tileUrl: string;
    }[],
  ): OptionalLayerEntry[] | undefined => {
    if (!serialized || serialized.length === 0) return undefined;
    return serialized.map((l) => ({
      layerId: l.layerId,
      title: l.title,
      opacity: l.opacity,
      tileUrl: l.tileUrl,
    }));
  };

  store.hydrateMapState({
    mainBaseLayer,
    subBaseLayer,
    mainProjection: state.mainProjection,
    subProjection: state.subProjection,
    mainOptionalLayers: toOptionalLayers(state.mainOptionalLayers),
    subOptionalLayers: toOptionalLayers(state.subOptionalLayers),
  });

  // Hydrate grid state
  store.hydrateGridState({
    isDisplayLatLngGrid: state.isDisplayLatLngGrid,
    isDisplayUtmGrid: state.isDisplayUtmGrid,
    isDisplayTileGrid: state.isDisplayTileGrid,
    isDisplayRegionalMesh: state.isDisplayRegionalMesh,
    isDisplayMapSheetNumbers: state.isDisplayMapSheetNumbers,
  });

  // Hydrate relief state
  store.hydrateReliefState({
    isReliefWindowOpen: state.isReliefWindowOpen,
    isHillshadeEnabled: state.isHillshadeEnabled,
    selectedPatternId: state.selectedPatternId,
    elevationRanges: state.elevationRanges,
  });

  store.setIsHydrated(true);
};

interface Props {
  children: React.ReactNode;
}

export const StateHydrator = ({ children }: Props) => {
  // Hydrate synchronously during first render (client only).
  // Module-level guard ensures it runs exactly once, even in Strict Mode.
  if (!hydrationDone && typeof window !== "undefined") {
    hydrationDone = true;
    hydrateStore();
  }

  return children;
};
