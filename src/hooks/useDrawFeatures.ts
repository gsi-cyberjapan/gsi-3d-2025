"use client";

import { useEffect, useState, useCallback } from "react";
import { useStore } from "@/hooks/store/useStore";
import { MapId } from "@/hooks/store/mapManagerState";
import { FeatureId } from "@/hooks/store/drawState";

const DEFAULT_SOURCE = "terradraw";

export interface FeatureGroup {
  /** ソースキー（`${mapId}:${source}`） */
  key: string;
  /** 地図ID */
  mapId: MapId;
  /** ソース名（ファイル名または "terradraw"） */
  source: string;
  /** フィーチャーIDのリスト */
  featureIds: FeatureId[];
  /** フィーチャー数 */
  count: number;
}

/**
 * 両方の地図のTerraDraw instanceからfeatureを取得し、
 * ソース別にグループ化して返すフック
 */
export const useDrawFeatures = (): FeatureGroup[] => {
  const mainTd = useStore((state) => state.maps.main.td);
  const subTd = useStore((state) => state.maps.sub.td);
  const activeMapIds = useStore((state) => state.activeMapIds);

  const [featureGroups, setFeatureGroups] = useState<FeatureGroup[]>([]);

  const getFeatureGroups = useCallback((): FeatureGroup[] => {
    const groupMap = new Map<string, FeatureGroup>();

    const processTd = (mapId: MapId) => {
      const td = mapId === "main" ? mainTd : subTd;
      if (!td || !activeMapIds.includes(mapId)) return;

      const snapshot = td.getSnapshot();

      for (const feature of snapshot) {
        // 完了したフィーチャーのみカウント（選択ハンドル、選択中、作図中のフィーチャーを除外）
        if (
          feature.properties.mode === "select" ||
          feature.properties.selected ||
          feature.properties.currentlyDrawing ||
          feature.properties.closingPoint
        ) {
          continue;
        }

        const source =
          typeof feature.properties.source === "string"
            ? feature.properties.source
            : DEFAULT_SOURCE;
        const key = `${mapId}:${source}`;

        if (!groupMap.has(key)) {
          groupMap.set(key, {
            key,
            mapId,
            source,
            featureIds: [],
            count: 0,
          });
        }

        const group = groupMap.get(key);
        if (group && feature.id !== undefined) {
          group.featureIds.push(feature.id);
          group.count++;
        }
      }
    };

    processTd("main");
    processTd("sub");

    return Array.from(groupMap.values());
  }, [mainTd, subTd, activeMapIds]);

  useEffect(() => {
    const updateGroups = () => {
      setFeatureGroups(getFeatureGroups());
    };

    // 初期化
    updateGroups();

    // TerraDraw の change イベントをリッスン
    const listeners: Array<() => void> = [];

    if (mainTd) {
      mainTd.on("change", updateGroups);
      listeners.push(() => {
        mainTd.off("change", updateGroups);
      });
    }

    if (subTd) {
      subTd.on("change", updateGroups);
      listeners.push(() => {
        subTd.off("change", updateGroups);
      });
    }

    // ポーリングでプロパティ変更を検出
    const intervalId = setInterval(() => {
      const current = getFeatureGroups();
      setFeatureGroups((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(current)) {
          return current;
        }
        return prev;
      });
    }, 300);

    return () => {
      for (const cleanup of listeners) {
        cleanup();
      }
      clearInterval(intervalId);
    };
  }, [mainTd, subTd, getFeatureGroups]);

  return featureGroups;
};
