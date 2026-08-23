"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePixelEditorStore } from "@/stores/pixelEditor-store";

export function PixelCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const isSelectingRef = useRef(false);
  const isMovingRef = useRef(false);
  const spacePressed = useRef(false);
  const isPanning = useRef(false);
  const panStartRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const lastPixelRef = useRef<{ x: number; y: number } | null>(null);
  const hoverPixelRef = useRef<{ x: number; y: number } | null>(null);
  const drawStartRef = useRef<{ x: number, y: number, btn: number } | null>(null);
  const moveStartRef = useRef<{ sx: number, sy: number } | null>(null);
  const rafRef = useRef<number>(0);

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

    const { layers, selection, selectionPixels, renderTick, canvasWidth, canvasHeight, zoom, panX, panY, gridVisible } =
      usePixelEditorStore.getState();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Maintain offscreen canvas cache for blazing fast hardware-accelerated rendering
    // @ts-ignore
    if (!canvas.offscreenCache) canvas.offscreenCache = document.createElement("canvas");
    // @ts-ignore
    const offscreen = canvas.offscreenCache as HTMLCanvasElement;
    if (offscreen.width !== canvasWidth) offscreen.width = canvasWidth;
    if (offscreen.height !== canvasHeight) offscreen.height = canvasHeight;

    // We invalidate the cache on renderTick change OR layers reference change OR selection changes
    // @ts-ignore
    if (canvas.lastRenderTick !== renderTick || canvas.lastLayers !== layers || canvas.lastSelection !== selection || canvas.lastSelectionPixels !== selectionPixels) {
      const oCtx = offscreen.getContext("2d");
      if (oCtx) {
        oCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Render each visible layer from bottom to top
        for (let i = 0; i < layers.length; i++) {
          const layer = layers[i];
          if (!layer.visible) continue;
          
          oCtx.globalAlpha = layer.opacity;
          const imgData = new ImageData(canvasWidth, canvasHeight);
          const data = imgData.data;

          for (const [key, color] of Object.entries(layer.pixels)) {
            const [px, py] = key.split(",").map(Number);
            if (px >= 0 && px < canvasWidth && py >= 0 && py < canvasHeight) {
              let r = 0, g = 0, b = 0, a = 255;
              if (color.startsWith("#")) {
                const hex = color.replace("#", "");
                if (hex.length === 6) { r = parseInt(hex.substring(0,2),16); g = parseInt(hex.substring(2,4),16); b = parseInt(hex.substring(4,6),16); }
                else if (hex.length === 3) { r = parseInt(hex.substring(0,1).repeat(2),16); g = parseInt(hex.substring(1,2).repeat(2),16); b = parseInt(hex.substring(2,3).repeat(2),16); }
              } else if (color.startsWith("rgba")) {
                const parts = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);
                if (parts) { r = parseInt(parts[1]); g = parseInt(parts[2]); b = parseInt(parts[3]); if (parts[4]) a = Math.round(parseFloat(parts[4]) * 255); }
              }
              const index = (py * canvasWidth + px) * 4;
              data[index] = r; data[index + 1] = g; data[index + 2] = b; data[index + 3] = a;
            }
          }
          
          // Draw this layer's pixel data to an intermediate canvas to respect globalAlpha properly
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = canvasWidth; tempCanvas.height = canvasHeight;
          const tempCtx = tempCanvas.getContext("2d");
          if (tempCtx) {
            tempCtx.putImageData(imgData, 0, 0);
            oCtx.drawImage(tempCanvas, 0, 0);
          }
        }
        oCtx.globalAlpha = 1;

        // Draw floating selection pixels on top
        if (selection && selectionPixels) {
          const sCtx = document.createElement("canvas").getContext("2d")!;
          sCtx.canvas.width = canvasWidth; sCtx.canvas.height = canvasHeight;
          const imgData = new ImageData(canvasWidth, canvasHeight);
          const data = imgData.data;
          for (const [key, color] of Object.entries(selectionPixels)) {
            const [dx, dy] = key.split(",").map(Number);
            const px = selection.x + dx, py = selection.y + dy;
            if (px >= 0 && px < canvasWidth && py >= 0 && py < canvasHeight) {
              let r = 0, g = 0, b = 0, a = 255;
              if (color.startsWith("#")) {
                const hex = color.replace("#", "");
                if (hex.length === 6) { r = parseInt(hex.substring(0,2),16); g = parseInt(hex.substring(2,4),16); b = parseInt(hex.substring(4,6),16); }
                else if (hex.length === 3) { r = parseInt(hex.substring(0,1).repeat(2),16); g = parseInt(hex.substring(1,2).repeat(2),16); b = parseInt(hex.substring(2,3).repeat(2),16); }
              }
              const index = (py * canvasWidth + px) * 4;
              data[index] = r; data[index + 1] = g; data[index + 2] = b; data[index + 3] = a;
            }
          }
          sCtx.putImageData(imgData, 0, 0);
          oCtx.drawImage(sCtx.canvas, 0, 0);
        }
      }
      // @ts-ignore
      canvas.lastRenderTick = renderTick;
      // @ts-ignore
      canvas.lastLayers = layers;
      // @ts-ignore
      canvas.lastSelection = selection;
      // @ts-ignore
      canvas.lastSelectionPixels = selectionPixels;
    }

    // Calculate visible grid range for checkerboard
    const startX = Math.max(0, Math.floor(-panX / zoom));
    const startY = Math.max(0, Math.floor(-panY / zoom));
    const endX = Math.min(canvasWidth - 1, Math.ceil((canvas.width - panX) / zoom));
    const endY = Math.min(canvasHeight - 1, Math.ceil((canvas.height - panY) / zoom));

    // Checkerboard background for transparency (only visible portion)
    for (let py = startY; py <= endY; py++) {
      for (let px = startX; px <= endX; px++) {
        const sx = panX + px * zoom;
        const sy = panY + py * zoom;
        ctx.fillStyle = (px + py) % 2 === 0 ? "#2d2d2d" : "#232323";
        ctx.fillRect(sx, sy, zoom, zoom);
      }
    }

    // Draw the cached pixel art in one super-fast hardware accelerated call
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offscreen, panX, panY, canvasWidth * zoom, canvasHeight * zoom);

    // --- Shape Previews ---
    const drawShapePixels = (tool: string, start: {x: number, y: number}, end: {x: number, y: number}, plot: (x: number, y: number) => void) => {
      const drawLine = (x0: number, y0: number, x1: number, y1: number) => {
        let lx = x0, ly = y0;
        const dx2 = Math.abs(x1 - lx), dy2 = Math.abs(y1 - ly);
        const sx2 = lx < x1 ? 1 : -1, sy2 = ly < y1 ? 1 : -1;
        let err = dx2 - dy2;
        while (true) {
          plot(lx, ly);
          if (lx === x1 && ly === y1) break;
          const e2 = 2 * err;
          if (e2 > -dy2) { err -= dy2; lx += sx2; }
          if (e2 < dx2) { err += dx2; ly += sy2; }
        }
      };

      if (tool === 'line') { drawLine(start.x, start.y, end.x, end.y); }
      else if (tool === 'rectangle') {
        const minX = Math.min(start.x, end.x), maxX = Math.max(start.x, end.x);
        const minY = Math.min(start.y, end.y), maxY = Math.max(start.y, end.y);
        for (let x = minX; x <= maxX; x++) { plot(x, minY); plot(x, maxY); }
        for (let y = minY + 1; y <= maxY - 1; y++) { plot(minX, y); plot(maxX, y); }
      } else if (tool === 'filled-rectangle') {
        const minX = Math.min(start.x, end.x), maxX = Math.max(start.x, end.x);
        const minY = Math.min(start.y, end.y), maxY = Math.max(start.y, end.y);
        for (let y = minY; y <= maxY; y++) { for (let x = minX; x <= maxX; x++) plot(x, y); }
      } else if (tool === 'circle') {
        const radius = Math.round(Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2));
        let x = 0, y = radius, d = 3 - 2 * radius;
        const cx = start.x, cy = start.y;
        while (y >= x) {
          plot(cx+x, cy+y); plot(cx-x, cy+y); plot(cx+x, cy-y); plot(cx-x, cy-y);
          plot(cx+y, cy+x); plot(cx-y, cy+x); plot(cx+y, cy-x); plot(cx-y, cy-x);
          x++;
          if (d > 0) { y--; d = d + 4 * (x - y) + 10; }
          else d = d + 4 * x + 6;
        }
      } else if (tool === 'triangle') {
        const topX = Math.round(start.x + (end.x - start.x) / 2);
        const topY = start.y;
        const blX = start.x, blY = end.y;
        const brX = end.x, brY = end.y;
        drawLine(topX, topY, blX, blY);
        drawLine(blX, blY, brX, brY);
        drawLine(brX, brY, topX, topY);
      }
    };

    if (isDrawingRef.current && drawStartRef.current && hoverPixelRef.current) {
      const { activeTool, primaryColor, secondaryColor } = usePixelEditorStore.getState();
      if (['line', 'rectangle', 'filled-rectangle', 'circle', 'triangle'].includes(activeTool)) {
        const start = drawStartRef.current;
        const end = hoverPixelRef.current;
        const color = start.btn === 2 ? secondaryColor : primaryColor;
        ctx.fillStyle = color;
        drawShapePixels(activeTool, start, end, (x, y) => {
          ctx.fillRect(panX + x * zoom, panY + y * zoom, zoom, zoom);
        });
      }
    }

    // --- Selection Rendering ---
    const curSelection = selection;
    if (isSelectingRef.current && drawStartRef.current && hoverPixelRef.current) {
      // Drawing new selection rect
      const minX = Math.min(drawStartRef.current.x, hoverPixelRef.current.x);
      const maxX = Math.max(drawStartRef.current.x, hoverPixelRef.current.x);
      const minY = Math.min(drawStartRef.current.y, hoverPixelRef.current.y);
      const maxY = Math.max(drawStartRef.current.y, hoverPixelRef.current.y);
      ctx.strokeStyle = "#fff";
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = (Date.now() / 50) % 8;
      ctx.lineWidth = 1;
      ctx.strokeRect(panX + minX * zoom, panY + minY * zoom, (maxX - minX + 1) * zoom, (maxY - minY + 1) * zoom);
      ctx.setLineDash([]);
    } else if (curSelection) {
      // Drawn selection rect
      ctx.strokeStyle = "#fff";
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = (Date.now() / 50) % 8;
      ctx.lineWidth = 1;
      ctx.strokeRect(panX + curSelection.x * zoom, panY + curSelection.y * zoom, curSelection.w * zoom, curSelection.h * zoom);
      ctx.setLineDash([]);
    }

    // --- Grid ---
    if (gridVisible && zoom >= 5) {
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 0.5;
      for (let py = 0; py <= canvasHeight; py++) {
        const sy = panY + py * zoom;
        ctx.beginPath(); ctx.moveTo(panX, sy); ctx.lineTo(panX + canvasWidth * zoom, sy); ctx.stroke();
      }
      for (let px = 0; px <= canvasWidth; px++) {
        const sx = panX + px * zoom;
        ctx.beginPath(); ctx.moveTo(sx, panY); ctx.lineTo(sx, panY + canvasHeight * zoom); ctx.stroke();
      }
    }

    // Canvas border
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(panX + 0.5, panY + 0.5, canvasWidth * zoom - 1, canvasHeight * zoom - 1);

    // --- Hover highlight ---
    const hp = hoverPixelRef.current;
    if (hp && !isSelectingRef.current && !isMovingRef.current) {
      const { activeTool, primaryColor } = usePixelEditorStore.getState();
      const sx = panX + hp.x * zoom;
      const sy = panY + hp.y * zoom;
      if (activeTool === 'eraser') ctx.strokeStyle = "rgba(255,80,80,0.9)";
      else if (activeTool === 'select' || activeTool === 'move') ctx.strokeStyle = "rgba(255,255,255,0.5)";
      else ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(sx + 1, sy + 1, zoom - 2, zoom - 2);
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
      
      const st = usePixelEditorStore.getState();
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); st.undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); st.redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') { e.preventDefault(); st.cutSelection(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') { e.preventDefault(); st.copySelection(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') { e.preventDefault(); st.pasteSelection(); }
      if (e.key === 'Delete' || e.key === 'Backspace') { st.deleteSelection(); }
      if (e.key === 'Escape') { st.setSelection(null); }

      if (!e.ctrlKey && !e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b': case 'p': st.setActiveTool('pencil'); break;
          case 'e': st.setActiveTool('eraser'); break;
          case 'f': st.setActiveTool('fill'); break;
          case 'i': st.setActiveTool('eyedropper'); break;
          case 'm': st.setActiveTool('select'); break;
          case 'v': st.setActiveTool('move'); break;
          case 'g': st.toggleGrid(); break;
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
      const st = usePixelEditorStore.getState();
      const { activeTool, primaryColor, secondaryColor, layers, activeLayerId } = st;
      const { x, y } = screenToPixel(screenX, screenY);
      const { canvasWidth, canvasHeight } = st;
      if (x < 0 || y < 0 || x >= canvasWidth || y >= canvasHeight) return;

      const layer = layers.find(l => l.id === activeLayerId);
      if (!layer || layer.locked) return;
      const color = button === 2 ? secondaryColor : primaryColor;

      switch (activeTool) {
        case 'pencil': st.setPixel(x, y, color); lastPixelRef.current = { x, y }; break;
        case 'eraser': st.erasePixel(x, y); lastPixelRef.current = { x, y }; break;
        case 'fill': st.floodFill(x, y, color); st.commitHistory(); break;
        case 'eyedropper': {
          // Read from flattened layers
          let picked = null;
          for (let i = layers.length - 1; i >= 0; i--) {
            if (!layers[i].visible) continue;
            const c = layers[i].pixels[`${x},${y}`];
            if (c) { picked = c; break; }
          }
          if (picked) {
            if (button === 2) st.setSecondaryColor(picked); else st.setPrimaryColor(picked);
          }
          break;
        }
      }
    };

    const applyShape = (start: {x: number, y: number, btn: number}, end: {x: number, y: number}, tool: string) => {
       const st = usePixelEditorStore.getState();
       const color = start.btn === 2 ? st.secondaryColor : st.primaryColor;
       const drawShapePixels = (tool: string, start: {x: number, y: number}, end: {x: number, y: number}, plot: (x: number, y: number) => void) => {
          const drawLine = (x0: number, y0: number, x1: number, y1: number) => {
            let lx = x0, ly = y0;
            const dx2 = Math.abs(x1 - lx), dy2 = Math.abs(y1 - ly);
            const sx2 = lx < x1 ? 1 : -1, sy2 = ly < y1 ? 1 : -1;
            let err = dx2 - dy2;
            while (true) {
              plot(lx, ly);
              if (lx === x1 && ly === y1) break;
              const e2 = 2 * err;
              if (e2 > -dy2) { err -= dy2; lx += sx2; }
              if (e2 < dx2) { err += dx2; ly += sy2; }
            }
          };

          if (tool === 'line') drawLine(start.x, start.y, end.x, end.y);
          else if (tool === 'rectangle') {
            const minX = Math.min(start.x, end.x), maxX = Math.max(start.x, end.x);
            const minY = Math.min(start.y, end.y), maxY = Math.max(start.y, end.y);
            for (let x = minX; x <= maxX; x++) { plot(x, minY); plot(x, maxY); }
            for (let y = minY + 1; y <= maxY - 1; y++) { plot(minX, y); plot(maxX, y); }
          } else if (tool === 'filled-rectangle') {
            const minX = Math.min(start.x, end.x), maxX = Math.max(start.x, end.x);
            const minY = Math.min(start.y, end.y), maxY = Math.max(start.y, end.y);
            for (let y = minY; y <= maxY; y++) { for (let x = minX; x <= maxX; x++) plot(x, y); }
          } else if (tool === 'circle') {
            const radius = Math.round(Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2));
            let x = 0, y = radius, d = 3 - 2 * radius;
            const cx = start.x, cy = start.y;
            while (y >= x) {
              plot(cx+x, cy+y); plot(cx-x, cy+y); plot(cx+x, cy-y); plot(cx-x, cy-y);
              plot(cx+y, cy+x); plot(cx-y, cy+x); plot(cx+y, cy-x); plot(cx-y, cy-x);
              x++; if (d > 0) { y--; d = d + 4 * (x - y) + 10; } else d = d + 4 * x + 6;
            }
          } else if (tool === 'triangle') {
            const topX = Math.round(start.x + (end.x - start.x) / 2);
            const blX = start.x, blY = end.y, brX = end.x, brY = end.y;
            drawLine(topX, start.y, blX, blY); drawLine(blX, blY, brX, brY); drawLine(brX, brY, topX, start.y);
          }
       };
       drawShapePixels(tool, start, end, (x, y) => st.setPixel(x, y, color));
    };

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      if (spacePressed.current || e.button === 1) {
        isPanning.current = true;
        const { panX, panY } = usePixelEditorStore.getState();
        panStartRef.current = { x: e.clientX, y: e.clientY, px: panX, py: panY };
        return;
      }
      
      const st = usePixelEditorStore.getState();
      const { x, y } = screenToPixel(e.offsetX, e.offsetY);

      if (e.button === 0 || e.button === 2) {
        if (st.activeTool === 'select') {
          isSelectingRef.current = true;
          drawStartRef.current = { x, y, btn: e.button };
          st.setSelection(null); // clear old selection
          return;
        }

        if (st.activeTool === 'move' && st.selection) {
          isMovingRef.current = true;
          moveStartRef.current = { sx: e.offsetX, sy: e.offsetY };
          if (!st.selectionPixels) {
            // first move -> cut out pixels to float them
            st.cutSelection();
          }
          return;
        }

        isDrawingRef.current = true;
        
        if (['line', 'rectangle', 'filled-rectangle', 'circle', 'triangle'].includes(st.activeTool)) {
          drawStartRef.current = { x, y, btn: e.button };
        } else {
          st.commitHistory();
          applyTool(e.offsetX, e.offsetY, e.button);
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const st = usePixelEditorStore.getState();
      const { x, y } = screenToPixel(e.offsetX, e.offsetY);
      const { canvasWidth, canvasHeight } = st;
      
      if (x >= 0 && y >= 0 && x < canvasWidth && y < canvasHeight) hoverPixelRef.current = { x, y };
      else hoverPixelRef.current = null;

      if (isPanning.current && panStartRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        st.setPan(panStartRef.current.px + dx, panStartRef.current.py + dy);
        return;
      }

      if (isSelectingRef.current) return;

      if (isMovingRef.current && moveStartRef.current && st.selection) {
        const dx = Math.round((e.offsetX - moveStartRef.current.sx) / st.zoom);
        const dy = Math.round((e.offsetY - moveStartRef.current.sy) / st.zoom);
        if (dx !== 0 || dy !== 0) {
          st.moveSelection(dx, dy);
          moveStartRef.current = { 
            sx: moveStartRef.current.sx + dx * st.zoom, 
            sy: moveStartRef.current.sy + dy * st.zoom 
          };
        }
        return;
      }

      if (!isDrawingRef.current) return;

      if (['line', 'rectangle', 'filled-rectangle', 'circle', 'triangle'].includes(st.activeTool)) return;

      const last = lastPixelRef.current;
      const cur = { x, y };
      if (last && (last.x !== cur.x || last.y !== cur.y)) {
        let lx = last.x, ly = last.y;
        const dx2 = Math.abs(cur.x - lx), dy2 = Math.abs(cur.y - ly);
        const sx2 = lx < cur.x ? 1 : -1, sy2 = ly < cur.y ? 1 : -1;
        let err = dx2 - dy2;
        while (true) {
          applyTool(
            st.panX + lx * st.zoom + st.zoom / 2,
            st.panY + ly * st.zoom + st.zoom / 2,
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
      const st = usePixelEditorStore.getState();
      
      if (isSelectingRef.current && drawStartRef.current && hoverPixelRef.current) {
        const s = drawStartRef.current, e = hoverPixelRef.current;
        const minX = Math.max(0, Math.min(s.x, e.x));
        const maxX = Math.min(st.canvasWidth - 1, Math.max(s.x, e.x));
        const minY = Math.max(0, Math.min(s.y, e.y));
        const maxY = Math.min(st.canvasHeight - 1, Math.max(s.y, e.y));
        const w = maxX - minX + 1, h = maxY - minY + 1;
        if (w > 0 && h > 0) st.setSelection({ x: minX, y: minY, w, h });
      }

      if (isDrawingRef.current) {
        if (drawStartRef.current && hoverPixelRef.current && ['line', 'rectangle', 'filled-rectangle', 'circle', 'triangle'].includes(st.activeTool)) {
           st.commitHistory();
           applyShape(drawStartRef.current, hoverPixelRef.current, st.activeTool);
        }
        st.finalizeStroke();
      }

      isDrawingRef.current = false;
      isSelectingRef.current = false;
      isMovingRef.current = false;
      isPanning.current = false;
      panStartRef.current = null;
      lastPixelRef.current = null;
      drawStartRef.current = null;
      moveStartRef.current = null;
    };

    const onMouseLeave = () => {
      hoverPixelRef.current = null;
      onMouseUp();
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const st = usePixelEditorStore.getState();
      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      const newZoom = Math.max(2, Math.min(64, Math.round(st.zoom * factor)));
      if (newZoom === st.zoom) return;
      const mx = e.offsetX, my = e.offsetY;
      const newPanX = mx - (mx - st.panX) * (newZoom / st.zoom);
      const newPanY = my - (my - st.panY) * (newZoom / st.zoom);
      st.setZoom(newZoom);
      st.setPan(Math.floor(newPanX), Math.floor(newPanY));
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
      case 'select': return 'crosshair';
      case 'move': return 'move';
      default: return 'crosshair';
    }
  };

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0f 100%)', cursor: getCursor() }}>
      <canvas ref={canvasRef} style={{ display: 'block', imageRendering: 'pixelated' }} />
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
      </div>
    </div>
  );
}
