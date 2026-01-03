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
    x: Math.max(50, (window.innerWidth - 300) / 2),
    y: Math.max(50, (window.innerHeight - 200) / 2),
  };
};

const DraggableWindowContent = React.memo(({
  title,
  onClose,
  children,
  className,
  isVisible,
  position,
}: {
  title: string;
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
  isVisible: boolean;
  position: { x: number; y: number };
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: "window",
    });

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
        "bg-background fixed z-9999 flex min-w-[300px] flex-col rounded-lg border shadow-lg",
        "origin-center [backface-visibility:hidden] [transform-style:preserve-3d]",
        isVisible
          ? "animate-in fade-in-0 zoom-in-95"
          : "animate-out fade-out-0 zoom-out-95",
        isDragging && "cursor-grabbing shadow-2xl",
        className,
      )}
      style={style}
    >
      {/* Header - Draggable */}
      <div
        className={cn(
          "flex items-center justify-between gap-2 rounded-t-lg border-b px-2 py-1 bg-input/30",
          "cursor-grab active:cursor-grabbing",
          "select-none",
        )}
        style={{ touchAction: "none" }}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold leading-none">{title}</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              "ring-offset-background focus:ring-ring hover:bg-accent hover:text-accent-foreground",
              "rounded-xs opacity-70 transition-opacity hover:opacity-100",
              "focus:ring-2 focus:ring-offset-2 focus:outline-hidden",
              "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            )}
            type="button"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-2">{children}</div>
    </div>
  );
});

DraggableWindowContent.displayName = "DraggableWindowContent";

export const Window = ({
  title,
  isOpen,
  onClose,
  children,
  className,
  defaultPosition,
}: WindowProps) => {
  const [isVisible, setIsVisible] = React.useState(isOpen);
  const [shouldRender, setShouldRender] = React.useState(isOpen);
  const [mounted, setMounted] = React.useState(false);
  const [position, setPosition] = React.useState(
    defaultPosition ?? getDefaultPosition(),
  );

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
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!defaultPosition) {
      setPosition(getDefaultPosition());
    }
  }, [defaultPosition]);

  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsVisible(true);
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

  if (!mounted || !shouldRender) return null;

  const windowContent = (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToWindowEdges]}
      onDragEnd={handleDragEnd}
    >
      <DraggableWindowContent
        title={title}
        onClose={onClose}
        className={className}
        isVisible={isVisible}
        position={position}
      >
        {children}
      </DraggableWindowContent>
    </DndContext>
  );

  return createPortal(windowContent, document.body);
};
