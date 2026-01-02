"use client";

import { useMap } from "react-map-gl/maplibre";
import { useEffect, useMemo } from "react";
import { useStore } from "@/hooks/store/useStore";
import { Source, Layer } from "react-map-gl/maplibre";

export const SearchResultController = () => {
  const mainMap = useMap()["main"]?.getMap();
  const subMap = useMap()["sub"]?.getMap();

  const resultLngLat = useStore((state) => state.resultLngLat);
  const addressSearchResult = useStore((state) => state.addressSearchResult);
  const hoveringAddressSearchSuggestId = useStore(
    (state) => state.hoveringAddressSearchSuggestId,
  );

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
    <Source id="search-results" type="geojson" data={geojsonData}>
      {/* 通常の候補ポイント */}
      <Layer
        id="search-results-circle"
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
  );
};
