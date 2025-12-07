"use client";

import { useStore } from "@/hooks/store/useStore";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import { GripVertical } from "lucide-react";
import { useMemo, type CSSProperties } from "react";

const OptionalLayerRow = ({
  layerId,
  title,
}: {
  layerId: string;
  title: string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: layerId });

  const style = useMemo<CSSProperties>(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition],
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1 rounded border bg-background/70 w-full  p-1 text-xs  ${
        isDragging ? "opacity-70" : ""
      }`}
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground"
        {...attributes}
        {...listeners}
        aria-label="ドラッグして順序を変更"
      >
        <GripVertical className="size-4" />
      </button>
      <span className="truncate">{title}</span>
    </div>
  );
};

export const OptionalLayerControler = () => {
  const focusMapId = useStore((state) => state.focusMapId);
  const optionalLayers = useStore(
    (state) => state.maps[focusMapId].optionalLayers,
  );
  const setOptionalLayer = useStore((state) => state.setOptionalLayer);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const oldIndex = optionalLayers.findIndex((l) => l.layerId === active.id);
    const newIndex = optionalLayers.findIndex((l) => l.layerId === over.id);

    if (oldIndex < 0 || newIndex < 0) return;

    const ordered = arrayMove(optionalLayers, oldIndex, newIndex);

    setOptionalLayer({
      mapId: focusMapId,
      layers: ordered,
    });
  };

  return (
    <div className="border rounded-md p-2 max-h-100 min-h-12 overflow-y-scroll scrollbar-transparent-thin">
      {optionalLayers.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            地図が選択されていません
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          autoScroll={false}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext
            items={optionalLayers.map((layer) => layer.layerId)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-1 ">
              {optionalLayers.map((layer) => (
                <OptionalLayerRow
                  key={layer.layerId}
                  layerId={layer.layerId}
                  title={layer.title}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
