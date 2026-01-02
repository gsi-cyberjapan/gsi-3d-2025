"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/maplibre";
import { TerraDraw, TerraDrawFreehandMode } from "terra-draw";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";

export const DrawController = ({ mapId }: { mapId: MapId }) => {
  const map = useMap()[mapId]?.getMap();
  const drawRef = useRef<TerraDraw | null>(null);

  useEffect(() => {
    if (!map) return;

    const setup = () => {
      if (drawRef.current) return;
      const draw = new TerraDraw({
        adapter: new TerraDrawMapLibreGLAdapter({ map }),
        modes: [new TerraDrawFreehandMode()],
      });
      drawRef.current = draw;
      draw.start();
    };

    if (map.isStyleLoaded()) {
      setup();
    } else {
      void map.once("style.load", setup);
    }

    return () => {
      map.off("style.load", setup);
      if (drawRef.current) {
        drawRef.current = null;
      }
    };
  }, [map]);

  return null;
};
