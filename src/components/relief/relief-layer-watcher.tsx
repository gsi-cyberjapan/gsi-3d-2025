"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/hooks/store/useStore";

const RELIEF_FREE_LAYER_ID = "relief_free";

/**
 * Watches for relief_free layer selection and auto-opens/closes the relief window
 */
export const ReliefLayerWatcher = () => {
  const mainOptionalLayers = useStore(
    (state) => state.maps.main.optionalLayers,
  );
  const subOptionalLayers = useStore((state) => state.maps.sub.optionalLayers);
  const setIsReliefWindowOpen = useStore(
    (state) => state.setIsReliefWindowOpen,
  );

  // Track previous state to detect changes
  const prevHasReliefRef = useRef(false);

  // Check if relief_free is active in any map
  const hasReliefLayer =
    mainOptionalLayers.some(
      (layer) => layer.layerId === RELIEF_FREE_LAYER_ID,
    ) ||
    subOptionalLayers.some((layer) => layer.layerId === RELIEF_FREE_LAYER_ID);

  useEffect(() => {
    const prevHasRelief = prevHasReliefRef.current;

    // Open window when relief layer is added
    if (hasReliefLayer && !prevHasRelief) {
      setIsReliefWindowOpen(true);
    }

    // Close window when relief layer is removed
    if (!hasReliefLayer && prevHasRelief) {
      setIsReliefWindowOpen(false);
    }

    prevHasReliefRef.current = hasReliefLayer;
  }, [hasReliefLayer, setIsReliefWindowOpen]);

  return null;
};
