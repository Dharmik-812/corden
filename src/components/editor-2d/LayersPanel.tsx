"use client";

import { useEditor2DStore } from "@/stores/editor2d-store";
import { useEffect, useState } from "react";
import { fabric } from "fabric";
import { Eye, EyeOff, Trash2, Box, Circle, Minus, Type, PenLine } from "lucide-react";

function getTypeIcon(type: string | undefined) {
  switch (type) {
    case 'rect': return <Box size={13} />;
    case 'ellipse': return <Circle size={13} />;
    case 'line': return <Minus size={13} />;
    case 'i-text': return <Type size={13} />;
    case 'path': return <PenLine size={13} />;
    default: return <Box size={13} />;
  }
}

function getTypeLabel(type: string | undefined, index: number) {
  const labels: Record<string, string> = {
    rect: 'Rectangle',
    ellipse: 'Ellipse',
    line: 'Line',
    'i-text': 'Text',
    path: 'Path',
  };
  return `${labels[type ?? ''] ?? type ?? 'Object'} ${index}`;
}

export function LayersPanel() {
  const { canvas, setSelectedObjectId } = useEditor2DStore();
  const [layers, setLayers] = useState<fabric.Object[]>([]);
  const [activeObj, setActiveObj] = useState<fabric.Object | null>(null);

  useEffect(() => {
    if (!canvas) return;

    const updateLayers = () => {
      setLayers([...canvas.getObjects()].reverse());
      setActiveObj(canvas.getActiveObject() || null);
    };

    updateLayers();
    canvas.on("object:added", updateLayers);
    canvas.on("object:removed", updateLayers);
    canvas.on("object:modified", updateLayers);
    canvas.on("selection:created", updateLayers);
    canvas.on("selection:updated", updateLayers);
    canvas.on("selection:cleared", updateLayers);

    return () => {
      canvas.off("object:added", updateLayers);
      canvas.off("object:removed", updateLayers);
      canvas.off("object:modified", updateLayers);
      canvas.off("selection:created", updateLayers);
      canvas.off("selection:updated", updateLayers);
      canvas.off("selection:cleared", updateLayers);
    };
  }, [canvas]);

  const selectLayer = (obj: fabric.Object) => {
    if (!canvas) return;
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    // @ts-ignore
    setSelectedObjectId(obj.id || obj.type || "object");
  };

  const toggleVisibility = (e: React.MouseEvent, obj: fabric.Object) => {
    e.stopPropagation();
    if (!canvas) return;
    obj.set('visible', !obj.visible);
    canvas.requestRenderAll();
    setLayers([...canvas.getObjects()].reverse());
  };

  const deleteLayer = (e: React.MouseEvent, obj: fabric.Object) => {
    e.stopPropagation();
    if (!canvas) return;
    canvas.remove(obj);
  };

  const totalObjects = canvas?.getObjects().length ?? 0;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(0, 0, 0, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Layers</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, background: 'rgba(74, 144, 226, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>{totalObjects}</span>
      </div>

      {/* Layer List */}
      <div style={{ padding: '12px', overflowY: 'auto', flex: 1 }}>
        {layers.length === 0 ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', textAlign: 'center', padding: '32px 0', opacity: 0.7 }}>
            No objects yet.<br />
            <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Use a tool above to draw.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {layers.map((obj, i) => {
              const isActive = activeObj === obj;
              return (
                <div
                  key={i}
                  onClick={() => selectLayer(obj)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                    background: isActive ? 'rgba(74, 144, 226, 0.15)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    border: `1px solid ${isActive ? 'rgba(74, 144, 226, 0.3)' : 'transparent'}`,
                    transition: 'all 0.2s',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                    opacity: obj.visible === false ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)' }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  {/* Type Icon */}
                  <span style={{ opacity: isActive ? 1 : 0.7, color: isActive ? 'var(--accent-primary)' : 'inherit', display: 'flex' }}>
                    {getTypeIcon(obj.type)}
                  </span>

                  {/* Label */}
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-mono)' }}>
                    {getTypeLabel(obj.type, layers.length - i)}
                  </span>

                  {/* Visibility Toggle */}
                  <button
                    onClick={(e) => toggleVisibility(e, obj)}
                    title="Toggle visibility"
                    style={{
                      background: 'transparent', border: 'none', color: 'inherit', padding: '4px', cursor: 'pointer', borderRadius: '4px', transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {obj.visible === false ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => deleteLayer(e, obj)}
                    title="Delete"
                    style={{
                      background: 'transparent', border: 'none', color: 'inherit', padding: '4px', cursor: 'pointer', borderRadius: '4px', transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(226, 93, 93, 0.2)'; e.currentTarget.style.color = '#E25D5D' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'inherit' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
