const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'editor-2d', 'PixelCanvas.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add drawStartRef
content = content.replace(
  'const hoverPixelRef = useRef<{ x: number; y: number } | null>(null);',
  'const hoverPixelRef = useRef<{ x: number; y: number } | null>(null);\n  const drawStartRef = useRef<{ x: number, y: number, btn: number } | null>(null);'
);

// 2. Add line/rect drawing in applyTool or onMouseDown?
// Actually, it's easier to modify onMouseDown, onMouseMove, onMouseUp.
const onMouseDownTarget = `    const onMouseDown = (e: MouseEvent) => {
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
    };`;

const onMouseDownReplace = `    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      if (spacePressed.current || e.button === 1) {
        isPanning.current = true;
        const { panX, panY } = usePixelEditorStore.getState();
        panStartRef.current = { x: e.clientX, y: e.clientY, px: panX, py: panY };
        return;
      }
      if (e.button === 0 || e.button === 2) {
        const { activeTool, canvasWidth, canvasHeight } = usePixelEditorStore.getState();
        const { x, y } = screenToPixel(e.offsetX, e.offsetY);
        
        if (activeTool === 'line' || activeTool === 'rectangle') {
          if (x >= 0 && y >= 0 && x < canvasWidth && y < canvasHeight) {
            isDrawingRef.current = true;
            drawStartRef.current = { x, y, btn: e.button };
          }
        } else {
          isDrawingRef.current = true;
          usePixelEditorStore.getState().commitHistory();
          applyTool(e.offsetX, e.offsetY, e.button);
        }
      }
    };`;
content = content.replace(onMouseDownTarget, onMouseDownReplace);

const onMouseMoveTarget = `      if (!isDrawingRef.current) return;
      // Interpolate for fast mouse moves (Bresenham's line between last and current)`;

const onMouseMoveReplace = `      if (!isDrawingRef.current) return;
      
      const { activeTool } = usePixelEditorStore.getState();
      if (activeTool === 'line' || activeTool === 'rectangle') {
        return; // wait for mouse up
      }

      // Interpolate for fast mouse moves (Bresenham's line between last and current)`;
content = content.replace(onMouseMoveTarget, onMouseMoveReplace);

const onMouseUpTarget = `    const onMouseUp = () => {
      isDrawingRef.current = false;
      isPanning.current = false;
      panStartRef.current = null;
      lastPixelRef.current = null;
    };`;

const onMouseUpReplace = `    const onMouseUp = () => {
      const { activeTool, primaryColor, secondaryColor } = usePixelEditorStore.getState();
      if (isDrawingRef.current && (activeTool === 'line' || activeTool === 'rectangle') && drawStartRef.current && hoverPixelRef.current) {
        usePixelEditorStore.getState().commitHistory();
        const color = drawStartRef.current.btn === 2 ? secondaryColor : primaryColor;
        const sx = drawStartRef.current.x;
        const sy = drawStartRef.current.y;
        const ex = hoverPixelRef.current.x;
        const ey = hoverPixelRef.current.y;
        
        if (activeTool === 'line') {
          let lx = sx, ly = sy;
          const dx2 = Math.abs(ex - lx), dy2 = Math.abs(ey - ly);
          const sx2 = lx < ex ? 1 : -1, sy2 = ly < ey ? 1 : -1;
          let err = dx2 - dy2;
          while (true) {
            usePixelEditorStore.getState().setPixel(lx, ly, color);
            if (lx === ex && ly === ey) break;
            const e2 = 2 * err;
            if (e2 > -dy2) { err -= dy2; lx += sx2; }
            if (e2 < dx2) { err += dx2; ly += sy2; }
          }
        } else if (activeTool === 'rectangle') {
          const minX = Math.min(sx, ex), maxX = Math.max(sx, ex);
          const minY = Math.min(sy, ey), maxY = Math.max(sy, ey);
          for (let py = minY; py <= maxY; py++) {
            for (let px = minX; px <= maxX; px++) {
              if (py === minY || py === maxY || px === minX || px === maxX) {
                usePixelEditorStore.getState().setPixel(px, py, color);
              }
            }
          }
        }
      }

      isDrawingRef.current = false;
      isPanning.current = false;
      panStartRef.current = null;
      lastPixelRef.current = null;
      drawStartRef.current = null;
    };`;
content = content.replace(onMouseUpTarget, onMouseUpReplace);

const renderTarget = `    // Hover highlight
    const hp = hoverPixelRef.current;`;

const renderReplace = `    // Shape preview
    if (isDrawingRef.current && drawStartRef.current && hoverPixelRef.current) {
      const { activeTool, primaryColor, secondaryColor } = usePixelEditorStore.getState();
      if (activeTool === 'line' || activeTool === 'rectangle') {
        const color = drawStartRef.current.btn === 2 ? secondaryColor : primaryColor;
        ctx.fillStyle = color + "88"; // Semi-transparent preview
        
        const sx = drawStartRef.current.x;
        const sy = drawStartRef.current.y;
        const ex = hoverPixelRef.current.x;
        const ey = hoverPixelRef.current.y;

        if (activeTool === 'line') {
          let lx = sx, ly = sy;
          const dx2 = Math.abs(ex - lx), dy2 = Math.abs(ey - ly);
          const sx2 = lx < ex ? 1 : -1, sy2 = ly < ey ? 1 : -1;
          let err = dx2 - dy2;
          while (true) {
            ctx.fillRect(panX + lx * zoom, panY + ly * zoom, zoom, zoom);
            if (lx === ex && ly === ey) break;
            const e2 = 2 * err;
            if (e2 > -dy2) { err -= dy2; lx += sx2; }
            if (e2 < dx2) { err += dx2; ly += sy2; }
          }
        } else if (activeTool === 'rectangle') {
          const minX = Math.min(sx, ex), maxX = Math.max(sx, ex);
          const minY = Math.min(sy, ey), maxY = Math.max(sy, ey);
          for (let py = minY; py <= maxY; py++) {
            for (let px = minX; px <= maxX; px++) {
              if (py === minY || py === maxY || px === minX || px === maxX) {
                ctx.fillRect(panX + px * zoom, panY + py * zoom, zoom, zoom);
              }
            }
          }
        }
      }
    }

    // Hover highlight
    const hp = hoverPixelRef.current;`;
content = content.replace(renderTarget, renderReplace);

fs.writeFileSync(file, content);
console.log('Patched successfully.');
