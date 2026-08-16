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

      {/* Export */}
      <button
        onClick={handleExport}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '0 16px', height: '36px', borderRadius: '10px',
          border: 'none', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)',
          fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
      >
        <Download size={16} strokeWidth={2} />
        Export
      </button>
    </div>
  );
}
