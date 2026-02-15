"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/hooks/store/useStore";
import { serializeState, SerializableStoreState } from "@/lib/stateSerializer";
import { writeHashState, writeCookieState } from "@/lib/statePersistence";

export const StatePersistenceController = () => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = useStore.subscribe((state) => {
      // Don't persist until hydration is complete
      if (!state.isHydrated) return;

      // Debounce writes
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        const storeState: SerializableStoreState = {
          viewStates: state.viewStates,
          layoutMode: state.layoutMode,
          isSyncPosition: state.isSyncPosition,
          subMapOpacityOnOverlay: state.subMapOpacityOnOverlay,
          isDisplayCenterLine: state.isDisplayCenterLine,
          isDisplayOverview: state.isDisplayOverview,
          isClickToMoveEnabled: state.isClickToMoveEnabled,
          isDisplayMagneticNorth: state.isDisplayMagneticNorth,
          maps: {
            main: {
              baseLayer: { id: state.maps.main.baseLayer.id },
              optionalLayers: state.maps.main.optionalLayers,
              projection: state.maps.main.projection,
              isHillshadeEnabled: state.maps.main.isHillshadeEnabled,
              isTerrainEnabled: state.maps.main.isTerrainEnabled,
              isPointCloudEnabled: state.maps.main.isPointCloudEnabled,
            },
            sub: {
              baseLayer: { id: state.maps.sub.baseLayer.id },
              optionalLayers: state.maps.sub.optionalLayers,
              projection: state.maps.sub.projection,
              isHillshadeEnabled: state.maps.sub.isHillshadeEnabled,
              isTerrainEnabled: state.maps.sub.isTerrainEnabled,
              isPointCloudEnabled: state.maps.sub.isPointCloudEnabled,
            },
          },
          isDisplayLatLngGrid: state.isDisplayLatLngGrid,
          isDisplayUtmGrid: state.isDisplayUtmGrid,
          isDisplayTileGrid: state.isDisplayTileGrid,
          isDisplayRegionalMesh: state.isDisplayRegionalMesh,
          isDisplayMapSheetNumbers: state.isDisplayMapSheetNumbers,
          isReliefWindowOpen: state.isReliefWindowOpen,
          isHillshadeEnabled: state.isHillshadeEnabled,
          selectedPatternId: state.selectedPatternId,
          elevationRanges: state.elevationRanges,
        };

        const serialized = serializeState(storeState);
        writeHashState(serialized);
        writeCookieState(serialized);
      }, 500);
    });

    return () => {
      unsubscribe();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return null;
};
