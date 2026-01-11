"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { getCircleModeStyle } from "@/lib/draw/getCircleModeStyle";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const setEditingFeature = useStore((state) => state.setEditingFeature);
  const setTerraDraw = useStore((state) => state.setTerraDraw);
  const [isStart, setIsStart] = useState(false);
  const drawMode = useStore((state) => state.drawMode);

  const handleDrawFinish = useCallback(
    (id: string | number) => {
      setEditingFeature({ featureId: id, mapId });
      drawRef.current?.updateFeatureProperties(id, {
        mapId,
        source: "terradraw",
      });
    },
    [setEditingFeature, mapId],
  );

  useEffect(() => {
    if (!drawRef.current || !isStart) return;
    if (isDrawWindowOpen) {
      drawRef.current.setMode(drawMode);
    } else {
      drawRef.current.setMode("static");
    }
  }, [isDrawWindowOpen, drawMode, isStart]);

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
      drawRef.current.updateModeOptions("circle", {
        styles: getCircleModeStyle(draw),
      });
      draw.on("finish", handleDrawFinish);

      setIsStart(true);
      setTerraDraw({ mapId, td: draw });
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
        // drawRef.current.stop();
        drawRef.current = null;
      }
    };
  }, [map, handleDrawFinish, mapId, setTerraDraw]);

  return null;
};
