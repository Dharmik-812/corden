"use client";

import { useEditor2DStore, ToolType } from "@/stores/editor2d-store";
import { MousePointer2, Square, Circle, Minus, Pencil, Type, Grid3X3, Download, Undo2, Redo2 } from "lucide-react";

export function Toolbar2D() {
  const { activeTool, setActiveTool, snapToGrid, setSnapToGrid, canvas } = useEditor2DStore();

  const tools: { id: ToolType; icon: React.ReactNode; label: string; shortcut: string }[] = [
    { id: 'select',   icon: <MousePointer2 size={16} strokeWidth={1.5} />, label: 'Select',    shortcut: 'V' },
    { id: 'rect',     icon: <Square         size={16} strokeWidth={1.5} />, label: 'Rectangle', shortcut: 'R' },
    { id: 'ellipse',  icon: <Circle         size={16} strokeWidth={1.5} />, label: 'Ellipse',   shortcut: 'E' },
    { id: 'line',     icon: <Minus          size={16} strokeWidth={1.5} />, label: 'Line',      shortcut: 'L' },
    { id: 'freehand', icon: <Pencil         size={16} strokeWidth={1.5} />, label: 'Freehand',  shortcut: 'F' },
    { id: 'text',     icon: <Type           size={16} strokeWidth={1.5} />, label: 'Text',      shortcut: 'T' },
  ];

  const handleExport = () => {
    if (!canvas) return;
    const svg = canvas.toSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'corden-draft.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '0 12px',
        width: '100%',
        height: '100%',
      }}
    >
      {/* Tool Group */}
      <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '3px' }}>
        {tools.map((tool) => (
          <button
            key={tool.id}
            title={`${tool.label} (${tool.shortcut})`}
            onClick={() => setActiveTool(tool.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: activeTool === tool.id ? 'var(--accent-primary)' : 'transparent',
              color: activeTool === tool.id ? '#fff' : 'var(--text-secondary)',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              if (activeTool !== tool.id) {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-tertiary)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTool !== tool.id) {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
              }
            }}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', background: 'var(--border-primary)', margin: '0 6px' }} />

      {/* Snap to Grid */}
      <button
        title="Snap to Grid"
        onClick={() => setSnapToGrid(!snapToGrid)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          background: snapToGrid ? 'rgba(74, 144, 226, 0.2)' : 'transparent',
          color: snapToGrid ? 'var(--accent-primary)' : 'var(--text-secondary)',
          transition: 'all 0.15s',
        }}
      >
        <Grid3X3 size={16} strokeWidth={1.5} />
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Active Tool Label */}
      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {tools.find(t => t.id === activeTool)?.label ?? 'Select'}
      </span>

      <div style={{ width: '1px', height: '24px', background: 'var(--border-primary)', margin: '0 6px' }} />

      {/* Export */}
      <button
        onClick={handleExport}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          background: 'var(--accent-primary)',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 600,
          transition: 'opacity 0.15s',
        }}
      >
        <Download size={13} strokeWidth={2} />
        Export SVG
      </button>
    </div>
  );
}
