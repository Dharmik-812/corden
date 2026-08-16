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
    <div className="h-full flex flex-col w-full">
      {/* Header */}
      <div
        style={{
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          borderBottom: '1px solid var(--border-primary)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
          Layers
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          {totalObjects}
        </span>
      </div>

      {/* Layer List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
        {layers.length === 0 ? (
          <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px', lineHeight: 1.5 }}>
            No objects yet.<br />
            <span style={{ color: 'var(--text-quaternary)', fontSize: '11px' }}>Use a tool above to draw.</span>
          </div>
        ) : (
          layers.map((obj, i) => {
            const isActive = activeObj === obj;
            return (
              <div
                key={i}
                onClick={() => selectLayer(obj)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(74,144,226,0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(74,144,226,0.3)' : '1px solid transparent',
                  marginBottom: '2px',
                  color: obj.visible === false ? 'var(--text-quaternary)' : 'var(--text-primary)',
                  transition: 'background 0.1s',
                }}
              >
                {/* Type Icon */}
                <span style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)', flexShrink: 0 }}>
                  {getTypeIcon(obj.type)}
                </span>

                {/* Label */}
                <span style={{ flex: 1, fontSize: '12px', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {getTypeLabel(obj.type, layers.length - i)}
                </span>

                {/* Visibility Toggle */}
                <button
                  onClick={(e) => toggleVisibility(e, obj)}
                  title="Toggle visibility"
                  style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', borderRadius: '3px', flexShrink: 0 }}
                >
                  {obj.visible === false ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>

                {/* Delete */}
                <button
                  onClick={(e) => deleteLayer(e, obj)}
                  title="Delete"
                  style={{ color: 'var(--text-quaternary)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', borderRadius: '3px', flexShrink: 0 }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
