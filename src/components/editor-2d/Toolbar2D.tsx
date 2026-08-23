"use client";

import { useEditor2DStore, ToolType } from "@/stores/editor2d-store";
import { MousePointer2, Square, Circle, Minus, Pencil, Type, Grid3X3, Download, ChevronDown } from "lucide-react";
import { useRef, useState } from "react";

export function Toolbar2D() {
  const { activeTool, setActiveTool, snapToGrid, setSnapToGrid, canvas } = useEditor2DStore();
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const tools: { id: ToolType; icon: React.ReactNode; label: string; shortcut: string }[] = [
    { id: 'select',   icon: <MousePointer2 size={16} strokeWidth={1.5} />, label: 'Select',    shortcut: 'V' },
    { id: 'rect',     icon: <Square         size={16} strokeWidth={1.5} />, label: 'Rectangle', shortcut: 'R' },
    { id: 'ellipse',  icon: <Circle         size={16} strokeWidth={1.5} />, label: 'Ellipse',   shortcut: 'E' },
    { id: 'line',     icon: <Minus          size={16} strokeWidth={1.5} />, label: 'Line',      shortcut: 'L' },
    { id: 'freehand', icon: <Pencil         size={16} strokeWidth={1.5} />, label: 'Freehand',  shortcut: 'F' },
    { id: 'text',     icon: <Type           size={16} strokeWidth={1.5} />, label: 'Text',      shortcut: 'T' },
  ];

  const exportPNG = (multiplier: number, label: string) => {
    if (!canvas) return;
    // Temporarily deselect so selection handles don't appear in export
    const activeObj = canvas.getActiveObject();
    canvas.discardActiveObject();
    canvas.requestRenderAll();

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier,
    });

    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `corden-draft-${label}.png`;
    a.click();

    // Restore selection
    if (activeObj) {
      canvas.setActiveObject(activeObj);
      canvas.requestRenderAll();
    }
    setExportOpen(false);
  };

  const exportSVG = () => {
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    canvas.discardActiveObject();
    canvas.requestRenderAll();

    const svg = canvas.toSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'corden-draft.svg';
    a.click();
    URL.revokeObjectURL(url);

    if (activeObj) {
      canvas.setActiveObject(activeObj);
      canvas.requestRenderAll();
    }
    setExportOpen(false);
  };

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', width: '100%', gap: '10px',
    padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer',
    color: 'rgba(255,255,255,0.82)', fontSize: '0.75rem', borderRadius: '7px',
    textAlign: 'left', transition: 'background 0.1s',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px',
      background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '16px', backdropFilter: 'blur(32px)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {tools.map((tool) => (
          <button
            key={tool.id}
            title={`${tool.label} (${tool.shortcut})`}
            onClick={() => setActiveTool(tool.id)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              background: activeTool === tool.id ? 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-brass) 100%)' : 'transparent',
              color: activeTool === tool.id ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeTool === tool.id ? '0 4px 12px rgba(74, 144, 226, 0.4)' : 'none',
            }}
            onMouseEnter={(e) => { if (activeTool !== tool.id) { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
            onMouseLeave={(e) => { if (activeTool !== tool.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 4px' }} />

      {/* Snap to Grid */}
      <button
        title="Snap to Grid"
        onClick={() => setSnapToGrid(!snapToGrid)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px',
          border: 'none', cursor: 'pointer', transition: 'all 0.2s',
          background: snapToGrid ? 'rgba(74, 144, 226, 0.15)' : 'transparent',
          color: snapToGrid ? 'var(--accent-primary)' : 'var(--text-secondary)'
        }}
        onMouseEnter={(e) => { if (!snapToGrid) { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
        onMouseLeave={(e) => { if (!snapToGrid) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
      >
        <Grid3X3 size={18} strokeWidth={1.5} />
      </button>

      <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 4px' }} />

      {/* Export dropdown */}
      <div ref={exportRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setExportOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '0 12px', height: '36px', borderRadius: '10px',
            border: 'none', cursor: 'pointer', background: exportOpen ? 'rgba(255,255,255,0.12)' : 'rgba(255, 255, 255, 0.05)',
            color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = exportOpen ? 'rgba(255,255,255,0.12)' : 'rgba(255, 255, 255, 0.05)'}
        >
          <Download size={15} strokeWidth={2} />
          Export
          <ChevronDown size={13} strokeWidth={2} style={{ opacity: 0.6, transform: exportOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
        </button>

        {exportOpen && (
          <div
            style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', right: 0,
              background: '#1a1d23', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '12px', boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              padding: '6px', minWidth: '210px', zIndex: 300,
            }}
          >
            <div style={{ padding: '6px 12px 4px', fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Export as
            </div>
            <button
              onClick={() => exportPNG(4, '4x')}
              style={btnBase}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <span style={{ fontSize: '1rem' }}>🖼️</span>
              <div>
                <div style={{ fontWeight: 600 }}>PNG — High Quality</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>4× resolution · lossless · recommended</div>
              </div>
            </button>
            <button
              onClick={() => exportPNG(2, '2x')}
              style={btnBase}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <span style={{ fontSize: '1rem' }}>🖼️</span>
              <div>
                <div style={{ fontWeight: 600 }}>PNG — Standard</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>2× resolution · smaller file size</div>
              </div>
            </button>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
            <button
              onClick={exportSVG}
              style={btnBase}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <span style={{ fontSize: '1rem' }}>📐</span>
              <div>
                <div style={{ fontWeight: 600 }}>SVG — Vector</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>Infinite scale · editable · for web/print</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
