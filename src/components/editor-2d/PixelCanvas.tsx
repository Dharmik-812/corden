"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePixelEditorStore } from "@/stores/pixelEditor-store";

export function PixelCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const spacePressed = useRef(false);
  const isPanning = useRef(false);
  const panStartRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const lastPixelRef = useRef<{ x: number; y: number } | null>(null);
  const hoverPixelRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number>();

  const store = usePixelEditorStore();

  const screenToPixel = useCallback((sx: number, sy: number) => {
    const { zoom, panX, panY } = usePixelEditorStore.getState();
    return {
      x: Math.floor((sx - panX) / zoom),
      y: Math.floor((sy - panY) / zoom),
    };
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { pixels, canvasWidth, canvasHeight, zoom, panX, panY, gridVisible } =
      usePixelEditorStore.getState();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Checkerboard background for transparency
    for (let py = 0; py < canvasHeight; py++) {
      for (let px = 0; px < canvasWidth; px++) {
        const sx = panX + px * zoom;
        const sy = panY + py * zoom;
        if (sx + zoom < 0 || sy + zoom < 0 || sx > canvas.width || sy > canvas.height) continue;
        ctx.fillStyle = (px + py) % 2 === 0 ? "#2d2d2d" : "#232323";
        ctx.fillRect(sx, sy, zoom, zoom);
      }
    }

    // Paint pixels
    for (const [key, color] of Object.entries(pixels)) {
      const [px, py] = key.split(",").map(Number);
      const sx = panX + px * zoom;
      const sy = panY + py * zoom;
      if (sx + zoom < 0 || sy + zoom < 0 || sx > canvas.width || sy > canvas.height) continue;
      ctx.fillStyle = color;
      ctx.fillRect(sx, sy, zoom, zoom);
    }

    // Grid
    if (gridVisible && zoom >= 5) {
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 0.5;
      for (let py = 0; py <= canvasHeight; py++) {
        const sy = panY + py * zoom;
        ctx.beginPath();
        ctx.moveTo(panX, sy);
        ctx.lineTo(panX + canvasWidth * zoom, sy);
        ctx.stroke();
      }
      for (let px = 0; px <= canvasWidth; px++) {
        const sx = panX + px * zoom;
        ctx.beginPath();
        ctx.moveTo(sx, panY);
        ctx.lineTo(sx, panY + canvasHeight * zoom);
        ctx.stroke();
      }
    }

    // Canvas border
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(panX + 0.5, panY + 0.5, canvasWidth * zoom - 1, canvasHeight * zoom - 1);

    // Hover highlight
    const hp = hoverPixelRef.current;
    if (hp) {
      const { activeTool, primaryColor } = usePixelEditorStore.getState();
      const sx = panX + hp.x * zoom;
      const sy = panY + hp.y * zoom;
      if (activeTool === 'eraser') {
        ctx.strokeStyle = "rgba(255,80,80,0.9)";
      } else {
        ctx.strokeStyle = primaryColor;
      }
      ctx.lineWidth = 2;
      ctx.strokeRect(sx + 1, sy + 1, zoom - 2, zoom - 2);
      // Semi-transparent fill preview
      if (activeTool === 'pencil') {
        ctx.fillStyle = primaryColor + "44";
        ctx.fillRect(sx + 1, sy + 1, zoom - 2, zoom - 2);
      }
    }
  }, []);

  // Animation loop
  useEffect(() => {
    const loop = () => {
      render();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [render]);

  // Canvas resize
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const centerCanvas = () => {
      const { canvasWidth, canvasHeight, zoom } = usePixelEditorStore.getState();
      const w = wrapper.clientWidth;
      const h = wrapper.clientHeight;
      canvas.width = w;
      canvas.height = h;
      // Center the pixel canvas
      usePixelEditorStore.getState().setPan(
        Math.floor((w - canvasWidth * zoom) / 2),
        Math.floor((h - canvasHeight * zoom) / 2)
      );
    };

    centerCanvas();
    const ro = new ResizeObserver(centerCanvas);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, []);

  // Re-center when canvas size changes
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;
    const { canvasWidth, canvasHeight, zoom } = store;
    usePixelEditorStore.getState().setPan(
      Math.floor((wrapper.clientWidth - canvasWidth * zoom) / 2),
      Math.floor((wrapper.clientHeight - canvasHeight * zoom) / 2)
    );
  }, [store.canvasWidth, store.canvasHeight]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') { spacePressed.current = true; e.preventDefault(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        usePixelEditorStore.getState().undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        usePixelEditorStore.getState().redo();
      }
      // Tool shortcuts
      if (!e.ctrlKey && !e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b': case 'p': usePixelEditorStore.getState().setActiveTool('pencil'); break;
          case 'e': usePixelEditorStore.getState().setActiveTool('eraser'); break;
          case 'f': usePixelEditorStore.getState().setActiveTool('fill'); break;
          case 'i': usePixelEditorStore.getState().setActiveTool('eyedropper'); break;
          case 'g': usePixelEditorStore.getState().toggleGrid(); break;
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') spacePressed.current = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Mouse interactions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const applyTool = (screenX: number, screenY: number, button: number) => {
      const { activeTool, primaryColor, secondaryColor, pixels } = usePixelEditorStore.getState();
      const { x, y } = screenToPixel(screenX, screenY);
      const { canvasWidth, canvasHeight } = usePixelEditorStore.getState();
      if (x < 0 || y < 0 || x >= canvasWidth || y >= canvasHeight) return;

      const color = button === 2 ? secondaryColor : primaryColor;

      switch (activeTool) {
        case 'pencil':
          usePixelEditorStore.getState().setPixel(x, y, color);
          lastPixelRef.current = { x, y };
          break;
        case 'eraser':
          usePixelEditorStore.getState().erasePixel(x, y);
          lastPixelRef.current = { x, y };
          break;
        case 'fill':
          usePixelEditorStore.getState().floodFill(x, y, color);
          usePixelEditorStore.getState().commitHistory();
          break;
        case 'eyedropper': {
          const picked = pixels[`${x},${y}`];
          if (picked) {
            if (button === 2) usePixelEditorStore.getState().setSecondaryColor(picked);
            else usePixelEditorStore.getState().setPrimaryColor(picked);
          }
          break;
        }
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      if (spacePressed.current || e.button === 1) {
        isPanning.current = true;
        const { panX, panY } = usePixelEditorStore.getState();
        panStartRef.current = { x: e.clientX, y: e.clientY, px: panX, py: panY };
        return;
      }
      if (e.button === 0 || e.button === 2) {
        isDrawingRef.current = true;
        usePixelEditorStore.getState().commitHistory();
        applyTool(e.offsetX, e.offsetY, e.button);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      // Update hover
      const { x, y } = screenToPixel(e.offsetX, e.offsetY);
      const { canvasWidth, canvasHeight } = usePixelEditorStore.getState();
      if (x >= 0 && y >= 0 && x < canvasWidth && y < canvasHeight) {
        hoverPixelRef.current = { x, y };
      } else {
        hoverPixelRef.current = null;
      }

      if (isPanning.current && panStartRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        usePixelEditorStore.getState().setPan(
          panStartRef.current.px + dx,
          panStartRef.current.py + dy
        );
        return;
      }

      if (!isDrawingRef.current) return;
      // Interpolate for fast mouse moves (Bresenham's line between last and current)
      const last = lastPixelRef.current;
      const cur = { x, y };
      if (last && (last.x !== cur.x || last.y !== cur.y)) {
        // Draw line between last and current pixel
        let lx = last.x, ly = last.y;
        const dx2 = Math.abs(cur.x - lx), dy2 = Math.abs(cur.y - ly);
        const sx2 = lx < cur.x ? 1 : -1, sy2 = ly < cur.y ? 1 : -1;
        let err = dx2 - dy2;
        while (true) {
          applyTool(
            usePixelEditorStore.getState().panX + lx * usePixelEditorStore.getState().zoom + usePixelEditorStore.getState().zoom / 2,
            usePixelEditorStore.getState().panY + ly * usePixelEditorStore.getState().zoom + usePixelEditorStore.getState().zoom / 2,
            e.buttons === 1 ? 0 : 2
          );
          if (lx === cur.x && ly === cur.y) break;
          const e2 = 2 * err;
          if (e2 > -dy2) { err -= dy2; lx += sx2; }
          if (e2 < dx2) { err += dx2; ly += sy2; }
        }
      } else {
        applyTool(e.offsetX, e.offsetY, e.buttons === 1 ? 0 : 2);
      }
    };

    const onMouseUp = () => {
      isDrawingRef.current = false;
      isPanning.current = false;
      panStartRef.current = null;
      lastPixelRef.current = null;
    };

    const onMouseLeave = () => {
      hoverPixelRef.current = null;
      onMouseUp();
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { zoom, panX, panY } = usePixelEditorStore.getState();
      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      const newZoom = Math.max(2, Math.min(64, Math.round(zoom * factor)));
      if (newZoom === zoom) return;
      // Zoom towards mouse cursor
      const mx = e.offsetX;
      const my = e.offsetY;
      const newPanX = mx - (mx - panX) * (newZoom / zoom);
      const newPanY = my - (my - panY) * (newZoom / zoom);
      usePixelEditorStore.getState().setZoom(newZoom);
      usePixelEditorStore.getState().setPan(Math.floor(newPanX), Math.floor(newPanY));
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('contextmenu', onContextMenu);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('contextmenu', onContextMenu);
    };
  }, [screenToPixel]);

  const { zoom, canvasWidth, canvasHeight, activeTool } = store;

  const getCursor = () => {
    if (spacePressed.current) return 'grab';
    switch (activeTool) {
      case 'eyedropper': return 'crosshair';
      case 'fill': return 'cell';
      case 'eraser': return 'cell';
      default: return 'crosshair';
    }
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        width: '100%', height: '100%', overflow: 'hidden', position: 'relative',
        background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0f 100%)',
        cursor: getCursor(),
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', imageRendering: 'pixelated' }}
      />
      {/* HUD: bottom bar */}
      <div style={{
        position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: '16px', padding: '8px 20px',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px',
        fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-tertiary)',
        pointerEvents: 'none', userSelect: 'none',
      }}>
        <span>{canvasWidth} × {canvasHeight} px</span>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <span>{zoom}x zoom</span>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <span>Scroll to zoom · Space+drag to pan</span>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
        <span>Ctrl+Z undo · Ctrl+Y redo</span>
      </div>
    </div>
  );
}
