"use client";

import { useMap, Popup } from "react-map-gl/maplibre";
import { useEffect, useMemo, useCallback, useState } from "react";
import { useStore } from "@/hooks/store/useStore";
import { Source, Layer } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import { MapId } from "@/hooks/store/mapManagerState";

const LAYER_ID = "search-results-circle";

interface PopupInfo {
  longitude: number;
  latitude: number;
  title: string;
  subTitle: string;
}

interface Props {
  mapId: MapId;
}

export const SearchResultController = ({ mapId }: Props) => {
  const { main: mainMapRef, sub: subMapRef } = useMap();
  const mainMap = mainMapRef?.getMap();
  const subMap = subMapRef?.getMap();
  const map = mapId === "main" ? mainMap : subMap;

  const resultLngLat = useStore((state) => state.resultLngLat);
  const addressSearchResult = useStore((state) => state.addressSearchResult);
  const hoveringAddressSearchSuggestId = useStore(
    (state) => state.hoveringAddressSearchSuggestId,
  );
  const setHoveringAddressSearchSuggestId = useStore(
    (state) => state.setHoveringAddressSearchSuggestId,
  );
  const setSelectedAddressCandidate = useStore(
    (state) => state.setSelectedAddressCandidate,
  );
  const setIsAddressSearchSuggestOpen = useStore(
    (state) => state.setIsAddressSearchSuggestOpen,
  );

  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);

  // resultLngLatが変化したときにその地点に移動
  useEffect(() => {
    if (!resultLngLat) return;

    const center = { lng: resultLngLat.lng, lat: resultLngLat.lat };

    if (mainMap) {
      mainMap.flyTo({
        center,
        zoom: Math.max(mainMap.getZoom(), 14),
        duration: 900,
      });
    }

    if (subMap) {
      subMap.flyTo({
        center,
        zoom: Math.max(subMap.getZoom(), 14),
        duration: 900,
      });
    }
  }, [resultLngLat, mainMap, subMap]);

  const handleMouseEnter = useCallback(
    (ev: MapLayerMouseEvent) => {
      if (!map || !ev.features?.[0]) return;
      const feature = ev.features[0];
      const { coordinates } = feature.geometry as GeoJSON.Point;

      map.getCanvas().style.cursor = "pointer";
      setHoveringAddressSearchSuggestId(String(feature.properties.id));
      setPopupInfo({
        longitude: coordinates[0],
        latitude: coordinates[1],
        title: String(feature.properties.title),
        subTitle: String(feature.properties.subTitle),
      });
    },
    [map, setHoveringAddressSearchSuggestId],
  );

  const handleMouseLeave = useCallback(() => {
    if (!map) return;
    map.getCanvas().style.cursor = "";
    setHoveringAddressSearchSuggestId(null);
    setPopupInfo(null);
  }, [map, setHoveringAddressSearchSuggestId]);

  const handleClick = useCallback(
    (ev: MapLayerMouseEvent) => {
      if (!ev.features?.[0]) return;

      setSelectedAddressCandidate(String(ev.features[0].properties.id));
      setIsAddressSearchSuggestOpen(false);
      setHoveringAddressSearchSuggestId(null);
      setPopupInfo(null);
    },
    [
      setSelectedAddressCandidate,
      setIsAddressSearchSuggestOpen,
      setHoveringAddressSearchSuggestId,
    ],
  );

  useEffect(() => {
    if (!map) return;

    map.on("mouseenter", LAYER_ID, handleMouseEnter);
    map.on("mouseleave", LAYER_ID, handleMouseLeave);
    map.on("click", LAYER_ID, handleClick);

    return () => {
      map.off("mouseenter", LAYER_ID, handleMouseEnter);
      map.off("mouseleave", LAYER_ID, handleMouseLeave);
      map.off("click", LAYER_ID, handleClick);
      map.getCanvas().style.cursor = "";
    };
  }, [map, handleMouseEnter, handleMouseLeave, handleClick]);

  // addressSearchResultからGeoJSONを生成
  const geojsonData = useMemo(() => {
    if (!addressSearchResult || addressSearchResult.candidates.length === 0) {
      return null;
    }

    return {
      type: "FeatureCollection" as const,
      features: addressSearchResult.candidates.map((candidate) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [candidate.lnglat.lng, candidate.lnglat.lat] as [
            number,
            number,
          ],
        },
        properties: {
          id: candidate.id,
          title: candidate.title,
          subTitle: candidate.subTitle,
          isHovering: candidate.id === hoveringAddressSearchSuggestId,
        },
      })),
    };
  }, [addressSearchResult, hoveringAddressSearchSuggestId]);

  if (!geojsonData) {
    return null;
  }

  return (
    <>
      <Source id="search-results" type="geojson" data={geojsonData}>
        <Layer
          id={LAYER_ID}
          type="circle"
          paint={{
            "circle-radius": ["case", ["get", "isHovering"], 8, 6],
            "circle-color": [
              "case",
              ["get", "isHovering"],
              "#ff6467", // hovering時は赤
              "#51a2ff", // 通常時は青
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#000000",
          }}
        />
      </Source>
      {popupInfo && (
        <Popup
          longitude={popupInfo.longitude}
          latitude={popupInfo.latitude}
          closeButton={false}
          closeOnClick={false}
          anchor="bottom"
          offset={[0, -10] as [number, number]}
        >
          <div className="text-xs">
            <div className="font-bold">{popupInfo.title}</div>
            <div className="text-muted-foreground">{popupInfo.subTitle}</div>
          </div>
        </Popup>
      )}
    </>
  );
};
