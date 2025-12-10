"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";

interface Props {
  mapId: MapId;
}

export const OptionalLayers = ({ mapId }: Props) => {
  const optionalLayers = useStore((state) => state.maps[mapId].optionalLayers);

  return <div>test</div>;
};
