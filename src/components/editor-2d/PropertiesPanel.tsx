"use client";

import { useEditor2DStore } from "@/stores/editor2d-store";
import { useEffect, useState } from "react";
import { fabric } from "fabric";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{label}</span>
      {children}
    </div>
  );
}

function NumberInput({ value, onChange }: { value: number; onChange: (v: string) => void }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '72px',
        padding: '4px 8px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: '5px',
        color: 'var(--text-primary)',
        fontSize: '12px',
        fontFamily: 'var(--font-mono)',
        textAlign: 'right',
        outline: 'none',
      }}
    />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '10px',
      fontWeight: 600,
      color: 'var(--text-quaternary)',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      fontFamily: 'var(--font-mono)',
      marginBottom: '10px',
      paddingBottom: '6px',
      borderBottom: '1px solid var(--border-secondary)',
    }}>
      {children}
    </div>
  );
}

const SWATCHES = [
  'transparent',
  '#ffffff',
  '#000000',
  '#4A90E2',
  '#7C5CBF',
  '#E2884A',
  '#E25D5D',
  '#4AE28E',
];

export function PropertiesPanel() {
  const { canvas } = useEditor2DStore();
  const [activeObj, setActiveObj] = useState<fabric.Object | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!canvas) return;
    const update = () => {
      setActiveObj(canvas.getActiveObject() || null);
      setTick(n => n + 1);
    };
    canvas.on("selection:created", update);
    canvas.on("selection:updated", update);
    canvas.on("selection:cleared", update);
    canvas.on("object:modified", update);
    canvas.on("object:moving", update);
    canvas.on("object:scaling", update);
    return () => {
      canvas.off("selection:created", update);
      canvas.off("selection:updated", update);
      canvas.off("selection:cleared", update);
      canvas.off("object:modified", update);
      canvas.off("object:moving", update);
      canvas.off("object:scaling", update);
    };
  }, [canvas]);

  const set = (prop: keyof fabric.Object, value: unknown) => {
    if (!canvas || !activeObj) return;
    activeObj.set(prop, value);
    activeObj.setCoords();
    canvas.requestRenderAll();
    setTick(n => n + 1);
  };

  const num = (v: string, fallback: number = 0) => {
    const n = parseFloat(v);
    return isNaN(n) ? fallback : n;
  };

  return (
    <div className="h-full flex flex-col w-full">
      {/* Header */}
      <div style={{
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        borderBottom: '1px solid var(--border-primary)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
          {activeObj ? `Properties — ${activeObj.type}` : 'Properties'}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
        {!activeObj ? (
          <div style={{ textAlign: 'center', color: 'var(--text-quaternary)', fontSize: '12px', marginTop: '40px', lineHeight: 1.6 }}>
            Select an object<br />to edit its properties.
          </div>
        ) : (
          <>
            {/* Transform */}
            <SectionLabel>Transform</SectionLabel>
            <Row label="X">
              <NumberInput value={Math.round(activeObj.left ?? 0)} onChange={v => set('left', num(v))} />
            </Row>
            <Row label="Y">
              <NumberInput value={Math.round(activeObj.top ?? 0)} onChange={v => set('top', num(v))} />
            </Row>
            <Row label="W">
              <NumberInput value={Math.round((activeObj.width ?? 0) * (activeObj.scaleX ?? 1))} onChange={v => set('width', num(v) / (activeObj.scaleX ?? 1))} />
            </Row>
            <Row label="H">
              <NumberInput value={Math.round((activeObj.height ?? 0) * (activeObj.scaleY ?? 1))} onChange={v => set('height', num(v) / (activeObj.scaleY ?? 1))} />
            </Row>
            <Row label="Angle">
              <NumberInput value={Math.round(activeObj.angle ?? 0)} onChange={v => set('angle', num(v))} />
            </Row>

            <div style={{ height: '20px' }} />

            {/* Appearance */}
            <SectionLabel>Appearance</SectionLabel>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>Fill</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {SWATCHES.map(color => (
                  <div
                    key={`fill-${color}`}
                    title={color}
                    onClick={() => set('fill', color)}
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: activeObj.fill === color ? '2px solid var(--accent-primary)' : '1px solid var(--border-primary)',
                      background: color === 'transparent'
                        ? 'repeating-linear-gradient(45deg,#444 0px,#444 5px,#222 5px,#222 10px)'
                        : color,
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={typeof activeObj.fill === 'string' && activeObj.fill !== 'transparent' ? activeObj.fill : '#ffffff'}
                  onChange={e => set('fill', e.target.value)}
                  style={{ width: '22px', height: '22px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                  title="Custom fill color"
                />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>Stroke</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {SWATCHES.map(color => (
                  <div
                    key={`stroke-${color}`}
                    title={color}
                    onClick={() => set('stroke', color)}
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: activeObj.stroke === color ? '2px solid var(--accent-primary)' : '1px solid var(--border-primary)',
                      background: color === 'transparent'
                        ? 'repeating-linear-gradient(45deg,#444 0px,#444 5px,#222 5px,#222 10px)'
                        : color,
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={typeof activeObj.stroke === 'string' && activeObj.stroke !== 'transparent' ? activeObj.stroke : '#4A90E2'}
                  onChange={e => set('stroke', e.target.value)}
                  style={{ width: '22px', height: '22px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                  title="Custom stroke color"
                />
              </div>
            </div>

            <Row label="Stroke W.">
              <NumberInput value={activeObj.strokeWidth ?? 0} onChange={v => set('strokeWidth', num(v))} />
            </Row>
            <Row label="Opacity">
              <NumberInput value={Math.round((activeObj.opacity ?? 1) * 100)} onChange={v => set('opacity', num(v) / 100)} />
            </Row>
          </>
        )}
      </div>
    </div>
  );
}
