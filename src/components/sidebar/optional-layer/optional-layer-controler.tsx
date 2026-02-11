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
import { GripVertical, Eye, EyeOff, SlidersHorizontal, Trash } from "lucide-react";
import { useMemo, type CSSProperties } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "../../ui/slider";

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
  const setOptionalLayer = useStore((state) => state.setOptionalLayer);
  const focusMapId = useStore((state) => state.focusMapId);
  const optionalLayers = useStore(
    (state) => state.maps[focusMapId].optionalLayers,
  );
  const targetLayer = optionalLayers.find((l) => l.layerId === layerId);
  const style = useMemo<CSSProperties>(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition],
  );

  const handleDeleteButtonClick = () => {
    setOptionalLayer({
      mapId: focusMapId,
      layers: optionalLayers.filter((l) => l.layerId !== layerId),
    });
  };

  const handleSliderChange = (values: number[]) => {
    setOptionalLayer({
      mapId: focusMapId,
      layers: optionalLayers.map((l) => {
        if (l.layerId !== layerId) return l;
        return {
          ...l,
          opacity: values[0],
        };
      }),
    });
  };

  const handleVisibilityToggle = () => {
    setOptionalLayer({
      mapId: focusMapId,
      layers: optionalLayers.map((l) => {
        if (l.layerId !== layerId) return l;
        return {
          ...l,
          visible: !l.visible,
        };
      }),
    });
  };

  if (!targetLayer) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1 justify-between rounded border bg-background/70 w-full  p-1 text-xs  ${
        isDragging ? "opacity-70" : ""
      } ${!targetLayer.visible ? "opacity-50" : ""}`}
    >
      <div className="flex gap-1 items-center min-w-0">
        <button
          type="button"
          className="cursor-grab text-muted-foreground"
          {...attributes}
          {...listeners}
          aria-label="ドラッグして順序を変更"
        >
          <GripVertical className="size-4" />
        </button>
        <button
          type="button"
          className="cursor-pointer text-muted-foreground"
          aria-label={targetLayer.visible ? "非表示にする" : "表示する"}
          onClick={handleVisibilityToggle}
        >
          {targetLayer.visible ? (
            <Eye className="size-4" />
          ) : (
            <EyeOff className="size-4" />
          )}
        </button>
        <span className="truncate">{title}</span>
      </div>
      <div className="flex gap-1 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="cursor-pointer text-muted-foreground border rounded-sm p-0.5"
              aria-label="透過率を変更"
            >
              <SlidersHorizontal className="size-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-2 w-58">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                地図の透過率
              </span>
              <div className="flex gap-2 items-center">
                <Slider
                  value={[targetLayer.opacity]}
                  onValueChange={handleSliderChange}
                  max={1}
                  step={0.01}
                />
                <div className="w-10 text-sm text-right">
                  {targetLayer.opacity.toFixed(2)}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <button
          type="button"
          className="cursor-pointer text-muted-foreground border rounded-sm p-0.5 hover:text-destructive transition-colors"
          aria-label="地図を削除"
          onClick={handleDeleteButtonClick}
        >
          <Trash className="size-4" />
        </button>
      </div>
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
          autoScroll
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
