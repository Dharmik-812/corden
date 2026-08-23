"use client";

import { usePixelEditorStore, PixelTool, CanvasSize } from "@/stores/pixelEditor-store";
import { Pencil, Eraser, PaintBucket, Pipette, Grid3X3, Trash2, Download, ZoomIn, ZoomOut, Undo2, Redo2, Save, Minus, Square, SplitSquareHorizontal, ChevronRight } from "lucide-react";
import { useState } from "react";

const CANVAS_SIZES: CanvasSize[] = [8, 16, 32, 48, 64, 128];

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
}

function ToolButton({ icon, label, shortcut, active, danger, onClick }: ToolButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        title={shortcut ? `${label} (${shortcut})` : label}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '40px', height: '40px', borderRadius: '10px', border: 'none',
          cursor: 'pointer', transition: 'all 0.15s ease',
          background: active
            ? 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-brass) 100%)'
            : hovered
            ? 'rgba(255,255,255,0.08)'
            : 'transparent',
          color: active ? '#fff' : danger && hovered ? '#ff6b6b' : 'var(--text-secondary)',
          boxShadow: active ? '0 4px 14px rgba(74,144,226,0.4)' : 'none',
        }}
      >
        {icon}
      </button>
    </div>
  );
}

export function PixelToolbar({ onSave }: { onSave?: () => void }) {
  const {
    activeTool, setActiveTool, gridVisible, toggleGrid,
    zoom, setZoom, setPan, panX, panY, canvasWidth, canvasHeight,
    clearCanvas, undo, redo, historyIndex, history,
    setCanvasSize, symmetryMode, setSymmetryMode,
  } = usePixelEditorStore();

  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showSymmetryMenu, setShowSymmetryMenu] = useState(false);

  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExportPNG = (scale: number) => {
    const { pixels, canvasWidth, canvasHeight } = usePixelEditorStore.getState();
    const offscreen = document.createElement("canvas");
    offscreen.width = canvasWidth * scale;
    offscreen.height = canvasHeight * scale;
    const ctx = offscreen.getContext("2d")!;
    ctx.imageSmoothingEnabled = false; // keep pixels sharp
    ctx.clearRect(0, 0, offscreen.width, offscreen.height);
    for (const [key, color] of Object.entries(pixels)) {
      const [px, py] = key.split(",").map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(px * scale, py * scale, scale, scale);
    }
    const url = offscreen.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `corden-pixel-${canvasWidth * scale}x${canvasHeight * scale}.png`;
    a.click();
    setShowExportMenu(false);
  };

  const tools: { id: PixelTool; icon: React.ReactNode; label: string; shortcut: string }[] = [
    { id: 'pencil', icon: <Pencil size={18} strokeWidth={1.5} />, label: 'Pencil', shortcut: 'B' },
    { id: 'eraser', icon: <Eraser size={18} strokeWidth={1.5} />, label: 'Eraser', shortcut: 'E' },
    { id: 'fill', icon: <PaintBucket size={18} strokeWidth={1.5} />, label: 'Fill Bucket', shortcut: 'F' },
    { id: 'eyedropper', icon: <Pipette size={18} strokeWidth={1.5} />, label: 'Eyedropper', shortcut: 'I' },
    { id: 'line', icon: <Minus size={18} strokeWidth={1.5} />, label: 'Line', shortcut: 'L' },
    { id: 'rectangle', icon: <Square size={18} strokeWidth={1.5} />, label: 'Rectangle', shortcut: 'R' },
  ];

  const panelStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
    padding: '10px 8px',
    background: 'rgba(10, 10, 14, 0.85)',
    backdropFilter: 'blur(32px)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '18px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
  };

  const dividerStyle: React.CSSProperties = {
    width: '24px', height: '1px',
    background: 'rgba(255,255,255,0.06)',
    margin: '2px 0',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Main tools */}
      <div style={panelStyle}>
        {tools.map((tool) => (
          <ToolButton
            key={tool.id}
            icon={tool.icon}
            label={tool.label}
            shortcut={tool.shortcut}
            active={activeTool === tool.id}
            onClick={() => setActiveTool(tool.id)}
          />
        ))}
      </div>

      {/* Symmetry */}
      <div style={panelStyle}>
        <div style={{ position: 'relative' }}>
          <button
            title="Symmetry Mode"
            onClick={() => setShowSymmetryMenu((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '40px', height: '40px', borderRadius: '10px', border: 'none',
              cursor: 'pointer', transition: 'all 0.15s ease',
              background: symmetryMode !== 'none'
                ? 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-brass) 100%)'
                : showSymmetryMenu ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: symmetryMode !== 'none' ? '#fff' : 'var(--text-secondary)',
              boxShadow: symmetryMode !== 'none' ? '0 4px 14px rgba(74,144,226,0.4)' : 'none',
            }}
          >
            <SplitSquareHorizontal size={18} strokeWidth={1.5} />
          </button>
          {showSymmetryMenu && (
            <div style={{
              position: 'absolute', left: '52px', top: 0, zIndex: 100,
              background: 'rgba(10,10,14,0.95)', backdropFilter: 'blur(32px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
              padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px',
              minWidth: '130px', boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
            }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', padding: '4px 8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Symmetry</div>
              {(['none', 'horizontal', 'vertical', 'both'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => { setSymmetryMode(mode); setShowSymmetryMenu(false); }}
                  style={{
                    padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: symmetryMode === mode ? 'rgba(74,144,226,0.15)' : 'transparent',
                    color: symmetryMode === mode ? 'var(--accent-primary)' : 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)', fontSize: '0.8rem', transition: 'background 0.15s', textTransform: 'capitalize'
                  }}
                  onMouseEnter={(e) => { if (symmetryMode !== mode) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={(e) => { if (symmetryMode !== mode) e.currentTarget.style.background = 'transparent'; }}
                >
                  {mode}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zoom & Grid */}
      <div style={panelStyle}>
        <ToolButton
          icon={<ZoomIn size={18} strokeWidth={1.5} />}
          label="Zoom In"
          onClick={() => {
            const newZ = Math.min(64, Math.round(zoom * 1.5));
            setZoom(newZ);
          }}
        />
        <ToolButton
          icon={<ZoomOut size={18} strokeWidth={1.5} />}
          label="Zoom Out"
          onClick={() => {
            const newZ = Math.max(2, Math.round(zoom / 1.5));
            setZoom(newZ);
          }}
        />
        <div style={dividerStyle} />
        <ToolButton
          icon={<Grid3X3 size={18} strokeWidth={1.5} />}
          label="Toggle Grid (G)"
          active={gridVisible}
          onClick={toggleGrid}
        />
      </div>

      {/* Undo/Redo */}
      <div style={panelStyle}>
        <ToolButton
          icon={<Undo2 size={18} strokeWidth={1.5} />}
          label="Undo (Ctrl+Z)"
          onClick={undo}
        />
        <ToolButton
          icon={<Redo2 size={18} strokeWidth={1.5} />}
          label="Redo (Ctrl+Y)"
          onClick={redo}
        />
      </div>

      {/* Canvas size & export */}
      <div style={panelStyle}>
        {/* Canvas Size */}
        <div style={{ position: 'relative' }}>
          <button
            title="Canvas Size"
            onClick={() => setShowSizeMenu((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '40px', height: '40px', borderRadius: '10px', border: 'none',
              cursor: 'pointer', background: showSizeMenu ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: 'var(--text-secondary)', transition: 'all 0.15s', fontSize: '0.6rem',
              fontFamily: 'var(--font-mono)', fontWeight: 700, flexDirection: 'column', gap: '1px',
            }}
          >
            <span style={{ fontSize: '0.55rem', lineHeight: 1 }}>{canvasWidth}</span>
            <span style={{ fontSize: '0.45rem', color: 'var(--text-tertiary)', lineHeight: 1 }}>PX</span>
          </button>
          {showSizeMenu && (
            <div style={{
              position: 'absolute', left: '52px', top: 0, zIndex: 100,
              background: 'rgba(10,10,14,0.95)', backdropFilter: 'blur(32px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
              padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px',
              minWidth: '130px', boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
            }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', padding: '4px 8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Canvas Size</div>
              {CANVAS_SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setCanvasSize(s, s); setShowSizeMenu(false); }}
                  style={{
                    padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: canvasWidth === s ? 'rgba(74,144,226,0.15)' : 'transparent',
                    color: canvasWidth === s ? 'var(--accent-primary)' : 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)', fontSize: '0.8rem', transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (canvasWidth !== s) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={(e) => { if (canvasWidth !== s) e.currentTarget.style.background = 'transparent'; }}
                >
                  {s} × {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={dividerStyle} />
        {onSave && (
          <ToolButton
            icon={<Save size={18} strokeWidth={1.5} />}
            label="Save (Ctrl+S)"
            onClick={onSave}
          />
        )}
        {/* Export with scale dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            title="Export PNG"
            onClick={() => setShowExportMenu(v => !v)}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = showExportMenu ? 'rgba(255,255,255,0.1)' : 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
              width: '40px', height: '40px', borderRadius: '10px', border: 'none',
              cursor: 'pointer', transition: 'all 0.15s ease',
              background: showExportMenu ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: 'var(--text-secondary)',
              gap: '1px',
            }}
          >
            <Download size={15} strokeWidth={1.5} />
            <ChevronRight size={8} strokeWidth={2} style={{ opacity: 0.5, transform: 'rotate(90deg)' }} />
          </button>
          {showExportMenu && (
            <div style={{
              position: 'absolute', left: '52px', bottom: 0, zIndex: 200,
              background: 'rgba(12,14,18,0.97)', backdropFilter: 'blur(32px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
              padding: '8px', display: 'flex', flexDirection: 'column', gap: '3px',
              minWidth: '190px', boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
            }}>
              <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', padding: '4px 8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Export PNG</div>
              {[
                { scale: 16, label: 'Ultra HQ', sub: `${canvasWidth*16}×${canvasHeight*16}px — print quality` },
                { scale: 8,  label: 'High Quality', sub: `${canvasWidth*8}×${canvasHeight*8}px — recommended` },
                { scale: 4,  label: 'Medium', sub: `${canvasWidth*4}×${canvasHeight*4}px` },
                { scale: 2,  label: 'Low', sub: `${canvasWidth*2}×${canvasHeight*2}px — smallest` },
              ].map(({ scale, label, sub }) => (
                <button
                  key={scale}
                  onClick={() => handleExportPNG(scale)}
                  style={{
                    padding: '8px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: 'transparent', transition: 'background 0.1s', display: 'flex', flexDirection: 'column', gap: '2px',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.75rem', fontWeight: 600 }}>{label} ({scale}×)</span>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.62rem', fontFamily: 'var(--font-mono)' }}>{sub}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <ToolButton
          icon={<Trash2 size={18} strokeWidth={1.5} />}
          label="Clear Canvas"
          danger
          onClick={() => {
            if (confirm('Clear the entire canvas?')) clearCanvas();
          }}
        />
      </div>
    </div>
  );
}
