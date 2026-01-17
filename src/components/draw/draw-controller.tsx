"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { createTextMode } from "@/lib/draw/createTextMode";
import { getCircleModeStyle } from "@/lib/draw/getCircleModeStyle";
import { getLineStringModeStyle } from "@/lib/draw/getLineStringModeStyle";
import { getPolygonModeStyle } from "@/lib/draw/getPolygonModeStyle";
import {
  getTextModeStyle,
  DEFAULT_TEXT_COLOR,
  DEFAULT_TEXT_SIZE,
  DEFAULT_TEXT_BOLD,
  DEFAULT_TEXT_ITALIC,
  DEFAULT_TEXT_UNDERLINE,
  DEFAULT_IS_HTML,
  DEFAULT_TEXT_CONTENT,
} from "@/lib/draw/getTextModeStyle";
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
  ValidateNotSelfIntersecting,
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
      const feature = drawRef.current?.getSnapshotFeature(id);
      const isTextMode = feature?.properties.mode === "text";

      setEditingFeature({ featureId: id, mapId });

      // テキストモードの場合はテキストプロパティを初期化
      if (isTextMode) {
        drawRef.current?.updateFeatureProperties(id, {
          mapId,
          source: "terradraw",
          textContent: DEFAULT_TEXT_CONTENT,
          textColor: DEFAULT_TEXT_COLOR,
          textSize: DEFAULT_TEXT_SIZE,
          textBold: DEFAULT_TEXT_BOLD,
          textItalic: DEFAULT_TEXT_ITALIC,
          textUnderline: DEFAULT_TEXT_UNDERLINE,
          isHtml: DEFAULT_IS_HTML,
        });
      } else {
        drawRef.current?.updateFeatureProperties(id, {
          mapId,
          source: "terradraw",
        });
      }
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
          new TerraDrawPolygonMode({
            validation: ValidateNotSelfIntersecting,
          }),
          createTextMode(),
          new TerraDrawSelectMode(),
        ],
      });
      drawRef.current = draw;
      draw.start();
      drawRef.current.updateModeOptions("circle", {
        styles: getCircleModeStyle(draw),
      });
      drawRef.current.updateModeOptions("linestring", {
        styles: getLineStringModeStyle(draw),
      });
      drawRef.current.updateModeOptions("freehand-linestring", {
        styles: getLineStringModeStyle(draw),
      });
      drawRef.current.updateModeOptions("polygon", {
        styles: getPolygonModeStyle(draw),
      });
      drawRef.current.updateModeOptions("text", {
        styles: getTextModeStyle(),
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
