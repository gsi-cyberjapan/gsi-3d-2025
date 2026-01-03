"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { XIcon, GripHorizontalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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

const useDraggable = (defaultPosition?: { x: number; y: number }) => {
  const [position, setPosition] = React.useState(
    defaultPosition ?? getDefaultPosition(),
  );
  const [isDragging, setIsDragging] = React.useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);
  const dragStartPos = React.useRef({ x: 0, y: 0 });
  const currentPos = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    if (!defaultPosition) {
      const pos = getDefaultPosition();
      setPosition(pos);
      currentPos.current = pos;
    } else {
      currentPos.current = defaultPosition;
    }
  }, [defaultPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - currentPos.current.x,
      y: e.clientY - currentPos.current.y,
    };
  };

  React.useEffect(() => {
    if (!isDragging) return;

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        const newPos = {
          x: e.clientX - dragStartPos.current.x,
          y: e.clientY - dragStartPos.current.y,
        };
        currentPos.current = newPos;

        if (elementRef.current) {
          elementRef.current.style.left = `${newPos.x.toString()}px`;
          elementRef.current.style.top = `${newPos.y.toString()}px`;
        }
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setPosition(currentPos.current);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isDragging]);

  return { position, elementRef, handleMouseDown, isDragging };
};

export const Window = ({
  title,
  isOpen,
  onClose,
  children,
  className,
  defaultPosition,
}: WindowProps) => {
  const { position, elementRef, handleMouseDown, isDragging } =
    useDraggable(defaultPosition);
  const [isVisible, setIsVisible] = React.useState(isOpen);
  const [shouldRender, setShouldRender] = React.useState(isOpen);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
    <div
      ref={elementRef}
      className={cn(
        "bg-background fixed z-[9999] flex min-w-[300px] flex-col rounded-lg border shadow-lg",
        "origin-center",
        !isDragging && "transition-all duration-200",
        isVisible
          ? "animate-in fade-in-0 zoom-in-95"
          : "animate-out fade-out-0 zoom-out-95",
        isDragging && "cursor-grabbing shadow-2xl transition-none",
        className,
      )}
      style={{
        top: `${position.y.toString()}px`,
        left: `${position.x.toString()}px`,
      }}
    >
      {/* Header - Draggable */}
      <div
        className={cn(
          "flex items-center justify-between gap-2 rounded-t-lg border-b px-4 py-3",
          "cursor-grab active:cursor-grabbing",
          "select-none",
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripHorizontalIcon className="text-muted-foreground size-4" />
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
      <div className="flex-1 p-4">{children}</div>
    </div>
  );

  return createPortal(windowContent, document.body);
};
