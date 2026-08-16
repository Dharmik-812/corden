"use client";

import { useEditor2DStore } from "@/stores/editor2d-store";
import { useEffect, useState } from "react";
import { fabric } from "fabric";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{label}</span>
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
        width: '72px', padding: '4px 8px', background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px',
        color: 'var(--text-primary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
        textAlign: 'right', outline: 'none', transition: 'border-color 0.2s'
      }}
      onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
      onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
    />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold text-quaternary uppercase tracking-widest font-mono mb-2 pb-1.5 border-b border-secondary">
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(0, 0, 0, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Properties</span>
        {activeObj && <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, background: 'rgba(74, 144, 226, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>{activeObj.type}</span>}
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {!activeObj ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', textAlign: 'center', padding: '32px 0', opacity: 0.7 }}>
            Select an object<br />to edit its properties.
          </div>
        ) : (
          <>
            {/* Transform */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transform</label>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
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
              </div>
              <Row label="Rotation">
                <NumberInput value={Math.round(activeObj.angle ?? 0)} onChange={v => set('angle', num(v))} />
              </Row>
            </div>

            <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.05)' }} />

            {/* Appearance */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Appearance</label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Fill</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {SWATCHES.map(color => (
                    <div
                      key={`fill-${color}`}
                      title={color}
                      onClick={() => set('fill', color)}
                      style={{
                        width: '28px', height: '28px', borderRadius: '8px', cursor: 'pointer',
                        borderColor: activeObj.fill === color ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                        borderWidth: activeObj.fill === color ? '2px' : '1px', borderStyle: 'solid',
                        background: color === 'transparent' ? 'repeating-linear-gradient(45deg,#444 0px,#444 5px,#222 5px,#222 10px)' : color,
                        boxShadow: activeObj.fill === color ? '0 0 0 2px rgba(74, 144, 226, 0.3)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    />
                  ))}
                  <div style={{ position: 'relative', width: '28px', height: '28px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <input
                      type="color"
                      value={typeof activeObj.fill === 'string' && activeObj.fill !== 'transparent' ? activeObj.fill : '#ffffff'}
                      onChange={e => set('fill', e.target.value)}
                      style={{ position: 'absolute', top: '-10px', left: '-10px', width: '50px', height: '50px', cursor: 'pointer', border: 'none', padding: 0 }}
                      title="Custom fill color"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Stroke</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {SWATCHES.map(color => (
                    <div
                      key={`stroke-${color}`}
                      title={color}
                      onClick={() => set('stroke', color)}
                      style={{
                        width: '28px', height: '28px', borderRadius: '8px', cursor: 'pointer',
                        borderColor: activeObj.stroke === color ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                        borderWidth: activeObj.stroke === color ? '2px' : '1px', borderStyle: 'solid',
                        background: color === 'transparent' ? 'repeating-linear-gradient(45deg,#444 0px,#444 5px,#222 5px,#222 10px)' : color,
                        boxShadow: activeObj.stroke === color ? '0 0 0 2px rgba(74, 144, 226, 0.3)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    />
                  ))}
                  <div style={{ position: 'relative', width: '28px', height: '28px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <input
                      type="color"
                      value={typeof activeObj.stroke === 'string' && activeObj.stroke !== 'transparent' ? activeObj.stroke : '#4A90E2'}
                      onChange={e => set('stroke', e.target.value)}
                      style={{ position: 'absolute', top: '-10px', left: '-10px', width: '50px', height: '50px', cursor: 'pointer', border: 'none', padding: 0 }}
                      title="Custom stroke color"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                <Row label="Stroke Width">
                  <NumberInput value={activeObj.strokeWidth ?? 0} onChange={v => set('strokeWidth', num(v))} />
                </Row>
                <Row label="Opacity (%)">
                  <NumberInput value={Math.round((activeObj.opacity ?? 1) * 100)} onChange={v => set('opacity', num(v) / 100)} />
                </Row>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
