"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DndContext,
  useDraggable,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

interface WindowProps {
  title: string;
  isOpen: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
  defaultPosition?: { x: number; y: number };
}

const getDefaultPosition = () => {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  return {
    x: Math.max(50, window.innerWidth / 2),
    y: Math.max(50, window.innerHeight / 2),
  };
};

const DraggableContent = ({
  title,
  onClose,
  children,
  className,
  position,
}: {
  title: string;
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
  position: { x: number; y: number };
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: "window" });

  const style: React.CSSProperties = {
    top: `${position.y.toString()}px`,
    left: `${position.x.toString()}px`,
    transform: CSS.Transform.toString(transform),
    willChange: isDragging ? "transform" : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "fixed z-20 flex flex-col rounded-lg border bg-background shadow-lg",
        isDragging && "cursor-grabbing shadow-2xl",
        className,
      )}
      style={style}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2 rounded-t-lg border-b bg-input/30 px-2 py-1",
          "cursor-grab select-none active:cursor-grabbing",
        )}
        style={{ touchAction: "none" }}
        {...attributes}
        {...listeners}
      >
        <h2 className="text-sm font-semibold leading-none">{title}</h2>
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              "rounded-xs opacity-70 transition-opacity hover:opacity-100",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background",
              "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            )}
            type="button"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
      <div className="flex-1 p-2">{children}</div>
    </div>
  );
};

export const Window = ({
  title,
  isOpen,
  onClose,
  children,
  className,
  defaultPosition,
}: WindowProps) => {
  const [position, setPosition] = React.useState(
    defaultPosition ?? getDefaultPosition(),
  );
  const [isVisible, setIsVisible] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 0, tolerance: 5 },
    }),
  );

  const handleDragEnd = React.useCallback((event: DragEndEvent) => {
    const { delta } = event;
    setPosition((prev) => ({
      x: prev.x + delta.x,
      y: prev.y + delta.y,
    }));
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 200);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const windowContent = (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToWindowEdges]}
      onDragEnd={handleDragEnd}
    >
      <DraggableContent
        title={title}
        onClose={onClose}
        className={cn(
          className,
          "transition-opacity duration-200",
          isVisible ? "opacity-100" : "opacity-0",
        )}
        position={position}
      >
        {children}
      </DraggableContent>
    </DndContext>
  );

  return createPortal(windowContent, document.body);
};
