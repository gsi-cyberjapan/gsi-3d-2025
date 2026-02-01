"use client";

import { useStore } from "@/hooks/store/useStore";
import { useMap } from "react-map-gl/maplibre";
import { useEffect, useState, useMemo } from "react";
import { MapId } from "@/hooks/store/mapManagerState";
import Image from "next/image";

const COMPASS_IMAGE_URL =
  "https://maps.gsi.go.jp/vector/image/print/compass.png";

interface Props {
  mapId: MapId;
}

export const Compass = ({ mapId }: Props) => {
  const layoutMode = useStore((state) => state.layoutMode);
  const { [mapId]: mapRef } = useMap();
  const map = mapRef?.getMap();

  const [bearing, setBearing] = useState(0);
  const [pitch, setPitch] = useState(0);

  const shouldShow = useMemo(() => {
    if (layoutMode === "single") {
      return mapId === "main";
    } else if (layoutMode === "split") {
      return true;
    } else {
      // overlay: subマップにのみ表示（透過されない）
      return mapId === "sub";
    }
  }, [layoutMode, mapId]);

  useEffect(() => {
    if (!map) return;

    const updateOrientation = () => {
      setBearing(map.getBearing());
      setPitch(map.getPitch());
    };

    updateOrientation();

    map.on("move", updateOrientation);
    return () => {
      map.off("move", updateOrientation);
    };
  }, [map]);

  if (!shouldShow) return null;

  return (
    <div
      className="absolute top-2 right-2 z-10 pointer-events-none overflow-hidden"
      style={{ perspective: "100px" }}
    >
      <Image
        src={COMPASS_IMAGE_URL}
        alt="方位記号"
        width={48}
        height={48}
        style={{
          transform: `rotateX(${String(pitch)}deg) rotateZ(${String(-bearing)}deg)`,
          transformStyle: "preserve-3d",
        }}
        draggable={false}
        unoptimized
      />
    </div>
  );
};
