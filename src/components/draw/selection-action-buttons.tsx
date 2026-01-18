"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Marker } from "react-map-gl/maplibre";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GeoJSONStoreFeatures } from "terra-draw";

interface ButtonPosition {
  longitude: number;
  latitude: number;
}

/**
 * Calculate the top-right position of a feature's bounding box
 */
const getTopRightPosition = (
  feature: GeoJSONStoreFeatures,
): ButtonPosition | null => {
  const geometry = feature.geometry;

  switch (geometry.type) {
    case "Point": {
      const [lng, lat] = geometry.coordinates;
      return { longitude: lng, latitude: lat };
    }

    case "Polygon": {
      const coords = geometry.coordinates[0];
      if (coords.length === 0) return null;

      let maxLng = -Infinity;
      let maxLat = -Infinity;

      for (const [lng, lat] of coords) {
        if (lng > maxLng) maxLng = lng;
        if (lat > maxLat) maxLat = lat;
      }

      return { longitude: maxLng, latitude: maxLat };
    }

    case "LineString": {
      const coords = geometry.coordinates;
      if (coords.length === 0) return null;

      let maxLng = -Infinity;
      let maxLat = -Infinity;

      for (const [lng, lat] of coords) {
        if (lng > maxLng) maxLng = lng;
        if (lat > maxLat) maxLat = lat;
      }

      return { longitude: maxLng, latitude: maxLat };
    }

    default:
      return null;
  }
};

export const SelectionActionButtons = ({ mapId }: { mapId: MapId }) => {
  const selectedFeature = useStore((state) => state.selectedFeature);
  const setSelectedFeature = useStore((state) => state.setSelectedFeature);
  const setEditingFeature = useStore((state) => state.setEditingFeature);
  const td = useStore((state) => state.maps[mapId].td);

  // Counter to trigger re-calculation when feature changes
  const [changeCounter, setChangeCounter] = useState(0);

  // Subscribe to TerraDraw change events
  useEffect(() => {
    if (!td) return;

    const handleChange = () => {
      setChangeCounter((c) => c + 1);
    };

    td.on("change", handleChange);

    return () => {
      td.off("change", handleChange);
    };
  }, [td]);

  // Calculate position based on selected feature and change counter
  const position = useMemo((): ButtonPosition | null => {
    // Use changeCounter to trigger recalculation
    void changeCounter;

    if (!selectedFeature || selectedFeature.mapId !== mapId || !td) {
      return null;
    }

    const feature = td.getSnapshotFeature(selectedFeature.featureId);
    if (!feature) {
      return null;
    }

    return getTopRightPosition(feature);
  }, [selectedFeature, mapId, td, changeCounter]);

  const handleEdit = useCallback(() => {
    if (!selectedFeature || !td) return;

    // Deselect the feature first
    td.deselectFeature(selectedFeature.featureId);
    setSelectedFeature(null);

    // Open edit modal
    setEditingFeature({
      featureId: selectedFeature.featureId,
      mapId: selectedFeature.mapId,
    });
  }, [selectedFeature, td, setSelectedFeature, setEditingFeature]);

  const handleDelete = useCallback(() => {
    if (!selectedFeature || !td) return;

    // Remove the feature
    td.removeFeatures([selectedFeature.featureId]);

    // Clear selection
    setSelectedFeature(null);
  }, [selectedFeature, td, setSelectedFeature]);

  // Only show if this map has the selected feature
  if (!selectedFeature || selectedFeature.mapId !== mapId || !position) {
    return null;
  }

  return (
    <Marker
      longitude={position.longitude}
      latitude={position.latitude}
      anchor="bottom-left"
      offset={[4, -4]}
    >
      <div className="flex gap-1 bg-background/90 rounded-md shadow-lg p-1 border">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleEdit}
              className="size-7"
            >
              <Pencil className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>編集</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDelete}
              className="size-7 hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>削除</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </Marker>
  );
};
