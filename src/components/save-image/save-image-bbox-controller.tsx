"use client";

import { MapId } from "@/hooks/store/mapManagerState";
import { useStore } from "@/hooks/store/useStore";
import { useEffect, useCallback, useMemo, useRef } from "react";
import { Source, Layer, useMap } from "react-map-gl/maplibre";

interface Props {
  mapId: MapId;
}

type DragTarget = "move" | "nw" | "ne" | "sw" | "se" | null;

export const SaveImageBBoxController = ({ mapId }: Props) => {
  const map = useMap()[mapId]?.getMap();
  const isOpen = useStore((state) => state.isSaveImageWindowOpen);
  const isBBoxMode = useStore((state) => state.isSaveImageBBoxMode);
  const bbox = useStore((state) => state.saveImageBBox);
  const setSaveImageBBox = useStore((state) => state.setSaveImageBBox);
  const targetMapId = useStore((state) => state.saveImageTargetMapId);

  const dragTargetRef = useRef<DragTarget>(null);
  const dragStartRef = useRef<{ lng: number; lat: number } | null>(null);
  const bboxAtDragStartRef = useRef(bbox);

  const fillLayerId = `${mapId}-save-image-bbox-fill`;
  const lineLayerId = `${mapId}-save-image-bbox-line`;
  const handlesLayerId = `${mapId}-save-image-bbox-handles`;

  const isActive =
    isBBoxMode && isOpen && bbox !== null && mapId === targetMapId;

  const geojsonData = useMemo(() => {
    if (!bbox || !isActive) return null;

    const polygon = {
      type: "Feature" as const,
      properties: { kind: "bbox" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [bbox.west, bbox.north],
            [bbox.east, bbox.north],
            [bbox.east, bbox.south],
            [bbox.west, bbox.south],
            [bbox.west, bbox.north],
          ],
        ],
      },
    };

    const handles = [
      { lng: bbox.west, lat: bbox.north, corner: "nw" },
      { lng: bbox.east, lat: bbox.north, corner: "ne" },
      { lng: bbox.east, lat: bbox.south, corner: "se" },
      { lng: bbox.west, lat: bbox.south, corner: "sw" },
    ].map((h) => ({
      type: "Feature" as const,
      properties: { kind: "handle", corner: h.corner },
      geometry: {
        type: "Point" as const,
        coordinates: [h.lng, h.lat] as [number, number],
      },
    }));

    return {
      type: "FeatureCollection" as const,
      features: [polygon, ...handles],
    };
  }, [bbox, isActive]);

  const handleMouseDown = useCallback(
    (e: maplibregl.MapMouseEvent) => {
      if (!map || !bbox || !isActive) return;

      // Check if clicking on a corner handle
      const handleFeatures = map.queryRenderedFeatures(e.point, {
        layers: [handlesLayerId],
      });

      if (handleFeatures.length > 0) {
        const corner = handleFeatures[0].properties.corner as DragTarget;
        dragTargetRef.current = corner;
        dragStartRef.current = { lng: e.lngLat.lng, lat: e.lngLat.lat };
        bboxAtDragStartRef.current = { ...bbox };
        map.dragPan.disable();
        e.preventDefault();
        return;
      }

      // Check if clicking on the fill
      const fillFeatures = map.queryRenderedFeatures(e.point, {
        layers: [fillLayerId],
      });

      if (fillFeatures.length > 0) {
        dragTargetRef.current = "move";
        dragStartRef.current = { lng: e.lngLat.lng, lat: e.lngLat.lat };
        bboxAtDragStartRef.current = { ...bbox };
        map.dragPan.disable();
        e.preventDefault();
      }
    },
    [map, bbox, isActive, handlesLayerId, fillLayerId],
  );

  const handleMouseMove = useCallback(
    (e: maplibregl.MapMouseEvent) => {
      if (!map || !dragTargetRef.current || !dragStartRef.current) return;

      const startBBox = bboxAtDragStartRef.current;
      if (!startBBox) return;

      const dLng = e.lngLat.lng - dragStartRef.current.lng;
      const dLat = e.lngLat.lat - dragStartRef.current.lat;

      if (dragTargetRef.current === "move") {
        setSaveImageBBox({
          north: Math.round((startBBox.north + dLat) * 10000) / 10000,
          south: Math.round((startBBox.south + dLat) * 10000) / 10000,
          east: Math.round((startBBox.east + dLng) * 10000) / 10000,
          west: Math.round((startBBox.west + dLng) * 10000) / 10000,
        });
      } else {
        const newBBox = { ...startBBox };

        if (dragTargetRef.current === "nw" || dragTargetRef.current === "ne") {
          newBBox.north = Math.round((startBBox.north + dLat) * 10000) / 10000;
        }
        if (dragTargetRef.current === "sw" || dragTargetRef.current === "se") {
          newBBox.south = Math.round((startBBox.south + dLat) * 10000) / 10000;
        }
        if (dragTargetRef.current === "ne" || dragTargetRef.current === "se") {
          newBBox.east = Math.round((startBBox.east + dLng) * 10000) / 10000;
        }
        if (dragTargetRef.current === "nw" || dragTargetRef.current === "sw") {
          newBBox.west = Math.round((startBBox.west + dLng) * 10000) / 10000;
        }

        setSaveImageBBox(newBBox);
      }
    },
    [map, setSaveImageBBox],
  );

  const handleMouseUp = useCallback(() => {
    if (!map || !dragTargetRef.current) return;
    dragTargetRef.current = null;
    dragStartRef.current = null;
    bboxAtDragStartRef.current = null;
    map.dragPan.enable();
  }, [map]);

  // Set up cursor changes on hover
  useEffect(() => {
    if (!map || !isActive) return;

    const setCursorForHandles = () => {
      map.getCanvas().style.cursor = "nwse-resize";
    };
    const setCursorForFill = () => {
      if (!dragTargetRef.current) {
        map.getCanvas().style.cursor = "move";
      }
    };
    const resetCursor = () => {
      if (!dragTargetRef.current) {
        map.getCanvas().style.cursor = "default";
      }
    };

    map.on("mouseenter", handlesLayerId, setCursorForHandles);
    map.on("mouseleave", handlesLayerId, resetCursor);
    map.on("mouseenter", fillLayerId, setCursorForFill);
    map.on("mouseleave", fillLayerId, resetCursor);

    return () => {
      map.off("mouseenter", handlesLayerId, setCursorForHandles);
      map.off("mouseleave", handlesLayerId, resetCursor);
      map.off("mouseenter", fillLayerId, setCursorForFill);
      map.off("mouseleave", fillLayerId, resetCursor);
      map.getCanvas().style.cursor = "default";
    };
  }, [map, isActive, handlesLayerId, fillLayerId]);

  // Set up drag events
  useEffect(() => {
    if (!map || !isActive) return;

    map.on("mousedown", handleMouseDown);
    map.on("mousemove", handleMouseMove);

    const onWindowMouseUp = () => {
      handleMouseUp();
    };
    window.addEventListener("mouseup", onWindowMouseUp);

    return () => {
      map.off("mousedown", handleMouseDown);
      map.off("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", onWindowMouseUp);
    };
  }, [map, isActive, handleMouseDown, handleMouseMove, handleMouseUp]);

  if (!geojsonData) return null;

  return (
    <Source id={`${mapId}-save-image-bbox`} type="geojson" data={geojsonData}>
      <Layer
        id={fillLayerId}
        type="fill"
        filter={["==", ["get", "kind"], "bbox"]}
        paint={{
          "fill-color": "#3b82f6",
          "fill-opacity": 0.1,
        }}
      />
      <Layer
        id={lineLayerId}
        type="line"
        filter={["==", ["get", "kind"], "bbox"]}
        paint={{
          "line-color": "#3b82f6",
          "line-width": 2,
          "line-dasharray": [4, 4],
        }}
      />
      <Layer
        id={handlesLayerId}
        type="circle"
        filter={["==", ["get", "kind"], "handle"]}
        paint={{
          "circle-radius": 6,
          "circle-color": "#ffffff",
          "circle-stroke-color": "#3b82f6",
          "circle-stroke-width": 2,
        }}
      />
    </Source>
  );
};
