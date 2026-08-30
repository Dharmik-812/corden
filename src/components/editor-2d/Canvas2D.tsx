"use client";

import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";
import { useEditor2DStore } from "@/stores/editor2d-store";

export function Canvas2D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { setCanvas, activeTool, snapToGrid, gridSize, setSelectedObjectId } = useEditor2DStore();
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) return;

    const width = wrapperRef.current.clientWidth;
    const height = wrapperRef.current.clientHeight;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      selection: true,
      preserveObjectStacking: true,
    });

    setFabricCanvas(canvas);
    setCanvas(canvas);

    // Grid rendering is handled by CSS background in globals.css for performance
    // but we need to handle window resize and layout changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === wrapperRef.current) {
          canvas.setWidth(entry.contentRect.width);
          canvas.setHeight(entry.contentRect.height);
          canvas.renderAll();
        }
      }
    });

    resizeObserver.observe(wrapperRef.current);

    return () => {
      resizeObserver.disconnect();
      canvas.dispose();
      setCanvas(null);
    };
  }, [setCanvas]);

  // Handle Tool Changes & Selection
  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "freehand";
    
    if (activeTool !== "select") {
      fabricCanvas.discardActiveObject();
      fabricCanvas.requestRenderAll();
    }

    const handleSelectionCreated = (e: fabric.IEvent) => {
      if (e.selected && e.selected.length > 0) {
        // Store the selected object's ID
        // @ts-ignore - we are dynamically adding id
        setSelectedObjectId(e.selected[0].id || e.selected[0].type || "object");
      }
    };
    
    const handleSelectionCleared = () => {
      setSelectedObjectId(null);
    };

    fabricCanvas.on("selection:created", handleSelectionCreated);
    fabricCanvas.on("selection:updated", handleSelectionCreated);
    fabricCanvas.on("selection:cleared", handleSelectionCleared);

    return () => {
      fabricCanvas.off("selection:created", handleSelectionCreated);
      fabricCanvas.off("selection:updated", handleSelectionCreated);
      fabricCanvas.off("selection:cleared", handleSelectionCleared);
    };
  }, [fabricCanvas, activeTool, setSelectedObjectId]);

  // Handle Snap to Grid
  useEffect(() => {
    if (!fabricCanvas) return;

    const snapIfEnabled = (options: fabric.IEvent) => {
      if (!snapToGrid || !options.target) return;
      
      const target = options.target;
      const left = target.left || 0;
      const top = target.top || 0;

      target.set({
        left: Math.round(left / gridSize) * gridSize,
        top: Math.round(top / gridSize) * gridSize,
      });
    };

    fabricCanvas.on("object:moving", snapIfEnabled);

    return () => {
      fabricCanvas.off("object:moving", snapIfEnabled);
    };
  }, [fabricCanvas, snapToGrid, gridSize]);

  // Handle Object Creation based on active tool (Click-to-draw simplified)
  useEffect(() => {
    if (!fabricCanvas) return;

    let isDrawing = false;
    let shape: fabric.Object | null = null;
    let startX = 0;
    let startY = 0;

    const onMouseDown = (o: fabric.IEvent) => {
      if (activeTool === "select" || activeTool === "freehand") return;
      
      isDrawing = true;
      const pointer = fabricCanvas.getPointer(o.e);
      startX = pointer.x;
      startY = pointer.y;

      const baseOptions = {
        id: uuidv4(),
        left: startX,
        top: startY,
        fill: "transparent",
        stroke: "var(--accent-primary)",
        strokeWidth: 2,
        selectable: false, // Wait until finished drawing
      };

      if (activeTool === "rect") {
        shape = new fabric.Rect({ ...baseOptions, width: 0, height: 0 });
      } else if (activeTool === "ellipse") {
        shape = new fabric.Ellipse({ ...baseOptions, rx: 0, ry: 0 });
      } else if (activeTool === "line") {
        shape = new fabric.Line([startX, startY, startX, startY], {
          id: uuidv4(),
          stroke: "var(--accent-primary)",
          strokeWidth: 2,
          selectable: false,
        } as any);
      } else if (activeTool === "text") {
        shape = new fabric.IText("Double click to edit", {
          id: uuidv4(),
          left: startX,
          top: startY,
          fontFamily: "var(--font-sans)",
          fontSize: 20,
          fill: "var(--text-primary)",
        } as any);
        fabricCanvas.add(shape);
        isDrawing = false;
        shape.setCoords();
        return;
      }

      if (shape) fabricCanvas.add(shape);
    };

    const onMouseMove = (o: fabric.IEvent) => {
      if (!isDrawing || !shape) return;
      
      const pointer = fabricCanvas.getPointer(o.e);
      let curX = pointer.x;
      let curY = pointer.y;

      if (snapToGrid) {
        curX = Math.round(curX / gridSize) * gridSize;
        curY = Math.round(curY / gridSize) * gridSize;
      }

      if (activeTool === "rect") {
        const rect = shape as fabric.Rect;
        rect.set({ width: Math.abs(startX - curX), height: Math.abs(startY - curY) });
        rect.set({ left: Math.min(curX, startX), top: Math.min(curY, startY) });
      } else if (activeTool === "ellipse") {
        const ellipse = shape as fabric.Ellipse;
        ellipse.set({ rx: Math.abs(startX - curX) / 2, ry: Math.abs(startY - curY) / 2 });
        ellipse.set({ left: Math.min(curX, startX), top: Math.min(curY, startY) });
      } else if (activeTool === "line") {
        const line = shape as fabric.Line;
        line.set({ x2: curX, y2: curY });
      }

      fabricCanvas.renderAll();
    };

    const onMouseUp = () => {
      if (!isDrawing) return;
      isDrawing = false;
      if (shape) {
        shape.set({ selectable: true });
        shape.setCoords();
        shape = null;
      }
    };

    fabricCanvas.on("mouse:down", onMouseDown);
    fabricCanvas.on("mouse:move", onMouseMove);
    fabricCanvas.on("mouse:up", onMouseUp);

    return () => {
      fabricCanvas.off("mouse:down", onMouseDown);
      fabricCanvas.off("mouse:move", onMouseMove);
      fabricCanvas.off("mouse:up", onMouseUp);
    };
  }, [fabricCanvas, activeTool, snapToGrid, gridSize]);

  return (
    <div ref={wrapperRef} className="editor-canvas grid-bg w-full h-full">
      <canvas ref={canvasRef} />
    </div>
  );
}
