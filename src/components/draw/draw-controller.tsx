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
import { getPointModeStyle } from "@/lib/draw/getPointModeStyle";
import { getSelectModeStyle } from "@/lib/draw/getSelectModeStyle";
import { getMeasureLineStringModeStyle } from "@/lib/measure/getMeasureLineStringModeStyle";
import { getMeasurePolygonModeStyle } from "@/lib/measure/getMeasurePolygonModeStyle";
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
import { DRAW_CONFIG } from "@/lib/config";

const TERRA_DRAW_LAYER_IDS = [
  "td-polygon",
  "td-polygon-outline",
  "td-linestring",
  "td-point",
  "td-point-marker",
] as const;

const applyModeOptions = (draw: TerraDraw) => {
  draw.updateModeOptions("circle", { styles: getCircleModeStyle(draw) });
  draw.updateModeOptions("linestring", {
    styles: getLineStringModeStyle(draw),
  });
  draw.updateModeOptions("freehand-linestring", {
    styles: getLineStringModeStyle(draw),
  });
  draw.updateModeOptions("polygon", { styles: getPolygonModeStyle(draw) });
  draw.updateModeOptions("text", { styles: getTextModeStyle() });
  draw.updateModeOptions("point", { styles: getPointModeStyle() });
  draw.updateModeOptions("select", { styles: getSelectModeStyle(draw) });
  draw.updateModeOptions("measure-linestring", {
    styles: getMeasureLineStringModeStyle(),
  });
  draw.updateModeOptions("measure-polygon", {
    styles: getMeasurePolygonModeStyle(),
  });
};

export const DrawController = ({ mapId }: { mapId: MapId }) => {
  const map = useMap()[mapId]?.getMap();
  const drawRef = useRef<TerraDraw | null>(null);
  const recoveringRef = useRef(false);
  const isDrawWindowOpen = useStore((state) => state.isDrawWindowOpen);
  const setEditingFeature = useStore((state) => state.setEditingFeature);
  const setTerraDraw = useStore((state) => state.setTerraDraw);
  const setSelectedFeature = useStore((state) => state.setSelectedFeature);
  const [isStart, setIsStart] = useState(false);
  const drawMode = useStore((state) => state.drawMode);
  const hiddenSources = useStore((state) => state.hiddenSources);
  const selectedMarkerSymbol = useStore((state) => state.selectedMarkerSymbol);
  const isMeasureWindowOpen = useStore((state) => state.isMeasureWindowOpen);
  const measureMode = useStore((state) => state.measureMode);
  const selectedMarkerSymbolRef = useRef(selectedMarkerSymbol);

  // Keep ref in sync with state
  useEffect(() => {
    selectedMarkerSymbolRef.current = selectedMarkerSymbol;
  }, [selectedMarkerSymbol]);

  const handleDrawFinish = useCallback(
    (id: string | number, context: { action: string }) => {
      // 新規フィーチャー作成時のみ編集ダイアログを開く
      if (context.action !== "draw") {
        return;
      }

      const feature = drawRef.current?.getSnapshotFeature(id);
      const featureMode = feature?.properties.mode;

      // 計測モードの場合はプロパティを設定して編集ダイアログを開かない
      if (
        featureMode === "measure-linestring" ||
        featureMode === "measure-polygon"
      ) {
        drawRef.current?.updateFeatureProperties(id, {
          mapId,
          source: "measure",
        });
        return;
      }

      const isTextMode = featureMode === "text";
      const isPointMode = featureMode === "point";

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
      } else if (isPointMode) {
        // ポイントモードの場合はマーカープロパティを初期化
        drawRef.current?.updateFeatureProperties(id, {
          mapId,
          source: "terradraw",
          "marker-symbol": selectedMarkerSymbolRef.current,
          "marker-size": DRAW_CONFIG.MARKER.DEFAULT_SIZE,
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

  const handleSelect = useCallback(
    (id: string | number) => {
      setSelectedFeature({ featureId: id, mapId });
    },
    [setSelectedFeature, mapId],
  );

  const handleDeselect = useCallback(() => {
    setSelectedFeature(null);
  }, [setSelectedFeature]);

  useEffect(() => {
    if (!drawRef.current || !isStart) return;
    if (isMeasureWindowOpen) {
      const mode =
        measureMode === "distance" ? "measure-linestring" : "measure-polygon";
      drawRef.current.setMode(mode);
    } else if (isDrawWindowOpen) {
      drawRef.current.setMode(drawMode);
    } else {
      drawRef.current.setMode("static");
    }
  }, [isDrawWindowOpen, drawMode, isStart, isMeasureWindowOpen, measureMode]);

  // モード切替時に選択を解除
  useEffect(() => {
    if (drawMode !== "select") {
      setSelectedFeature(null);
    }
  }, [drawMode, setSelectedFeature]);

  // hiddenSources 変更時にスタイルを再登録
  useEffect(() => {
    if (!drawRef.current || !isStart) return;
    applyModeOptions(drawRef.current);
  }, [hiddenSources, isStart]);

  // TerraDraw レイヤーの最上位維持 & スタイル変更時の復元
  useEffect(() => {
    if (!map || !isStart) return;

    const handleStyleData = () => {
      if (recoveringRef.current) return;

      const draw = drawRef.current;
      if (!draw) return;

      const allExist = TERRA_DRAW_LAYER_IDS.every(
        (id) => map.getLayer(id) !== undefined,
      );

      if (allExist) {
        // レイヤーが存在する場合は最上位に移動
        const layerOrder = map.getLayersOrder();
        const topLayers = layerOrder.slice(-TERRA_DRAW_LAYER_IDS.length);
        const alreadyOnTop = TERRA_DRAW_LAYER_IDS.every(
          (id, i) => topLayers[i] === id,
        );
        if (!alreadyOnTop) {
          for (const id of TERRA_DRAW_LAYER_IDS) {
            map.moveLayer(id);
          }
        }
        return;
      }

      // レイヤーが消えている場合は TerraDraw を復元
      recoveringRef.current = true;

      const snapshot = draw.getSnapshot();
      const featuresToRestore = snapshot.filter(
        (f) =>
          f.properties.mode !== "select" &&
          !f.properties.selected &&
          !f.properties.closingPoint &&
          !f.properties.currentlyDrawing,
      );

      try {
        draw.stop();
      } catch {
        /* レイヤーが既に消えているため例外が出る可能性あり */
      }
      draw.start();
      draw.clear();
      applyModeOptions(draw);

      if (featuresToRestore.length > 0) {
        draw.addFeatures(featuresToRestore);
      }

      // Zustand ストアからモードを復元
      const state = useStore.getState();
      if (state.isMeasureWindowOpen) {
        draw.setMode(
          state.measureMode === "distance"
            ? "measure-linestring"
            : "measure-polygon",
        );
      } else if (state.isDrawWindowOpen) {
        draw.setMode(state.drawMode);
      } else {
        draw.setMode("static");
      }

      setSelectedFeature(null);
      recoveringRef.current = false;
    };

    handleStyleData();
    map.on("styledata", handleStyleData);
    return () => {
      map.off("styledata", handleStyleData);
    };
  }, [map, isStart, setSelectedFeature]);

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
          new TerraDrawSelectMode({
            flags: {
              polygon: {
                feature: {
                  draggable: true,
                  coordinates: {
                    midpoints: true,
                    draggable: true,
                    deletable: true,
                  },
                },
              },
              linestring: {
                feature: {
                  draggable: true,
                  coordinates: {
                    midpoints: true,
                    draggable: true,
                    deletable: true,
                  },
                },
              },
              "freehand-linestring": {
                feature: {
                  draggable: true,
                  coordinates: {
                    midpoints: true,
                    draggable: true,
                    deletable: true,
                  },
                },
              },
              circle: {
                feature: {
                  draggable: true,
                  coordinates: {
                    midpoints: false,
                    draggable: true,
                    deletable: false,
                  },
                },
              },
              point: { feature: { draggable: false } },
              text: { feature: { draggable: false } },
            },
          }),
          // Measure modes
          new TerraDrawLineStringMode({ modeName: "measure-linestring" }),
          new TerraDrawPolygonMode({
            modeName: "measure-polygon",
            validation: ValidateNotSelfIntersecting,
          }),
        ],
      });
      drawRef.current = draw;
      draw.start();
      applyModeOptions(draw);
      draw.on("finish", handleDrawFinish);
      draw.on("select", handleSelect);
      draw.on("deselect", handleDeselect);

      setIsStart(true);
      setTerraDraw({ mapId, td: draw });
    };

    if (map.loaded()) {
      setup();
    } else {
      void map.once("load", setup);
    }

    return () => {
      map.off("load", setup);
      if (drawRef.current) {
        drawRef.current.off("finish", handleDrawFinish);
        drawRef.current.off("select", handleSelect);
        drawRef.current.off("deselect", handleDeselect);
        drawRef.current = null;
      }
    };
  }, [
    map,
    handleDrawFinish,
    handleSelect,
    handleDeselect,
    mapId,
    setTerraDraw,
  ]);

  return null;
};
