"use client";

import { useStore } from "@/hooks/store/useStore";
import { Trash2 } from "lucide-react";

export const OptionalLayerResetButton = () => {
  const focusMapId = useStore((state) => state.focusMapId);
  const optionalLayers = useStore(
    (state) => state.maps[focusMapId].optionalLayers,
  );
  const setOptionalLayer = useStore((state) => state.setOptionalLayer);

  const handleReset = () => {
    setOptionalLayer({ mapId: focusMapId, layers: [] });
  };

  return (
    <button
      type="button"
      className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="選択中の地図をすべて削除"
      disabled={optionalLayers.length === 0}
      onClick={handleReset}
    >
      <Trash2 className="size-3.5" />
    </button>
  );
};
