"use client";

import { useMap, Popup } from "react-map-gl/maplibre";
import { useEffect, useCallback, useRef } from "react";
import type { MapMouseEvent } from "maplibre-gl";
import { useStore } from "@/hooks/store/useStore";
import { MapId } from "@/hooks/store/mapManagerState";
import { FeaturePopupFeature } from "@/hooks/store/featurePopupState";
import { FeaturePopupContent } from "./feature-popup-content";

interface Props {
  mapId: MapId;
}

export const FeaturePopupController = ({ mapId }: Props) => {
  const { main: mainMapRef, sub: subMapRef } = useMap();
  const map = mapId === "main" ? mainMapRef?.getMap() : subMapRef?.getMap();
  const baseLayerType = useStore((state) => state.maps[mapId].baseLayer.type);
  const popup = useStore((state) => state.featurePopups[mapId]);
  const showFeaturePopup = useStore((state) => state.showFeaturePopup);
  const closeFeaturePopup = useStore((state) => state.closeFeaturePopup);
  const prevBaseLayerTypeRef = useRef(baseLayerType);

  // ベースレイヤー変更時にポップアップ閉じる
  useEffect(() => {
    if (prevBaseLayerTypeRef.current !== baseLayerType) {
      prevBaseLayerTypeRef.current = baseLayerType;
      closeFeaturePopup(mapId);
    }
  }, [baseLayerType, mapId, closeFeaturePopup]);

  const handleContextMenu = useCallback(
    (ev: MapMouseEvent) => {
      if (!map) return;

      ev.preventDefault();

      const renderedFeatures = map.queryRenderedFeatures(ev.point);
      if (!renderedFeatures.length) return;

      const features: FeaturePopupFeature[] = [];

      for (const f of renderedFeatures) {
        const properties: Record<string, unknown> = {};
        let hasProperty = false;

        for (const [key, value] of Object.entries(f.properties)) {
          if (key.startsWith("_")) continue;
          if (value === null || value === undefined || value === "") continue;
          properties[key] = value;
          hasProperty = true;
        }

        if (!hasProperty) continue;

        features.push({
          layerId: f.layer.id,
          sourceLayer: f.sourceLayer ?? f.layer.id,
          properties,
        });
      }

      if (!features.length) return;

      showFeaturePopup({
        mapId,
        popup: {
          longitude: ev.lngLat.lng,
          latitude: ev.lngLat.lat,
          features,
        },
      });
    },
    [map, mapId, showFeaturePopup],
  );

  const handleClick = useCallback(() => {
    closeFeaturePopup(mapId);
  }, [mapId, closeFeaturePopup]);

  useEffect(() => {
    if (!map || baseLayerType !== "vector") return;

    map.on("contextmenu", handleContextMenu);
    map.on("click", handleClick);

    return () => {
      map.off("contextmenu", handleContextMenu);
      map.off("click", handleClick);
    };
  }, [map, baseLayerType, handleContextMenu, handleClick]);

  if (!popup || baseLayerType !== "vector") return null;

  return (
    <Popup
      longitude={popup.longitude}
      latitude={popup.latitude}
      onClose={() => {
        closeFeaturePopup(mapId);
      }}
      maxWidth="320px"
      anchor="bottom"
    >
      <FeaturePopupContent features={popup.features} />
    </Popup>
  );
};
