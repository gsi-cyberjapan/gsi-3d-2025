"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/maplibre";
import {
  TerraDraw,
  TerraDrawCircleMode,
  TerraDrawPointMode,
  TerraDrawLineStringMode,
  TerraDrawFreehandLineStringMode,
  TerraDrawPolygonMode,
  TerraDrawSelectMode,
} from "terra-draw";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";

export const DrawController = ({ mapId }: { mapId: MapId }) => {
  const map = useMap()[mapId]?.getMap();
  const drawRef = useRef<TerraDraw | null>(null);
  const isDrawWindowOpen = useStore((state) => state.isDrawWindowOpen);
  const setEditingFeatureId = useStore((state) => state.setEditingFeatureId);
  const startedRef = useRef(false);
  const drawMode = useStore((state) => state.drawMode);

  const handleDrawFinish = (id: string | number) => {
    setEditingFeatureId(id);
  };

  useEffect(() => {
    if (!drawRef.current || !startedRef.current) return;

    if (isDrawWindowOpen) {
      drawRef.current.setMode(drawMode);
    } else {
      drawRef.current.setMode("static");
    }
  }, [isDrawWindowOpen, drawMode]);

  useEffect(() => {
    if (!map) return;

    const setup = () => {
      if (drawRef.current) return;
      const draw = new TerraDraw({
        adapter: new TerraDrawMapLibreGLAdapter({ map }),
        modes: [
          new TerraDrawPointMode(),
          new TerraDrawCircleMode(),
          new TerraDrawLineStringMode(),
          new TerraDrawFreehandLineStringMode(),
          new TerraDrawPolygonMode(),
          new TerraDrawSelectMode({
            flags: {
              point: {
                feature: {
                  draggable: true,
                },
              },
            },
          }),
        ],
      });
      drawRef.current = draw;
      draw.start();
      draw.on("finish", handleDrawFinish);
      startedRef.current = true;
    };

    if (map.isStyleLoaded()) {
      setup();
    } else {
      void map.once("style.load", setup);
    }

    return () => {
      map.off("style.load", setup);
      if (drawRef.current) {
        drawRef.current.off("finish", handleDrawFinish);
        drawRef.current.stop();
        drawRef.current = null;
      }
    };
  }, [map]);

  return null;
};
