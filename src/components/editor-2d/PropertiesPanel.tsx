"use client";

import { useEditor2DStore } from "@/stores/editor2d-store";
import { useEffect, useRef, useState } from "react";
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

const COLOR_PRESETS: Record<string, string[]> = {
  'Basics': ['#ffffff', '#e0e0e0', '#9e9e9e', '#616161', '#212121', '#000000', 'transparent'],
  'Red / Pink': ['#f44336', '#e91e63', '#ff5252', '#ff1744', '#f50057', '#ff4081', '#fce4ec', '#ffcdd2'],
  'Orange / Yellow': ['#ff9800', '#ff5722', '#ffc107', '#ffeb3b', '#ff6d00', '#ff3d00', '#fff9c4', '#ffe0b2'],
  'Green': ['#4caf50', '#8bc34a', '#00bcd4', '#009688', '#69f0ae', '#00e676', '#e8f5e9', '#c8e6c9'],
  'Blue / Purple': ['#2196f3', '#3f51b5', '#673ab7', '#9c27b0', '#448aff', '#536dfe', '#e8eaf6', '#e3f2fd'],
  'Brand': ['#4A90E2', '#7C5CBF', '#E2884A', '#4AE28E', '#E25D5D', '#5de2e7', '#a78bfa', '#34d399'],
};

function isValidHex(hex: string) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex);
}

function ColorPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [hexInput, setHexInput] = useState(value && value !== 'transparent' ? value : '#ffffff');
  const [openSection, setOpenSection] = useState<string | null>('Brand');
  const pickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value && value !== 'transparent') setHexInput(value);
  }, [value]);

  const pickColor = (color: string) => {
    onChange(color);
    if (color !== 'transparent') {
      setHexInput(color);
      setRecentColors(prev => [color, ...prev.filter(c => c !== color)].slice(0, 8));
    }
  };

  const handleHexCommit = () => {
    const hex = hexInput.startsWith('#') ? hexInput : '#' + hexInput;
    if (isValidHex(hex)) pickColor(hex);
    else setHexInput(value && value !== 'transparent' ? value : '#ffffff');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          onClick={() => pickerRef.current?.click()}
          title="Open color picker"
          style={{
            width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', flexShrink: 0,
            background: value === 'transparent'
              ? 'repeating-linear-gradient(45deg,#555 0px,#555 5px,#333 5px,#333 10px)'
              : value,
            border: '2px solid rgba(255,255,255,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <input
            ref={pickerRef}
            type="color"
            value={value && value !== 'transparent' ? value : '#ffffff'}
            onChange={e => pickColor(e.target.value)}
            style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer', border: 'none', padding: 0 }}
          />
        </div>
        <input
          type="text"
          value={hexInput}
          onChange={e => setHexInput(e.target.value)}
          onBlur={handleHexCommit}
          onKeyDown={e => { if (e.key === 'Enter') handleHexCommit(); }}
          maxLength={7}
          placeholder="#ffffff"
          style={{
            flex: 1, padding: '6px 10px', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
            color: '#fff', fontSize: '0.72rem', fontFamily: 'var(--font-mono)',
            outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(74,144,226,0.6)'}
        />
        <div
          onClick={() => pickColor('transparent')}
          title="Transparent"
          style={{
            width: '30px', height: '30px', borderRadius: '8px', cursor: 'pointer', flexShrink: 0,
            background: 'repeating-linear-gradient(45deg,#555 0px,#555 4px,#333 4px,#333 8px)',
            border: value === 'transparent' ? '2px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.12)',
            boxShadow: value === 'transparent' ? '0 0 0 2px rgba(74,144,226,0.3)' : 'none',
          }}
        />
      </div>

      {recentColors.length > 0 && (
        <div>
          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', marginBottom: '5px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Recent</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {recentColors.map((c, i) => (
              <div key={i} onClick={() => pickColor(c)} title={c} style={{
                width: '24px', height: '24px', borderRadius: '6px', cursor: 'pointer',
                background: c,
                border: value === c ? '2px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: value === c ? '0 0 0 2px rgba(74,144,226,0.3)' : 'none',
              }} />
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {Object.entries(COLOR_PRESETS).map(([cat, colors]) => (
          <div key={cat}>
            <button
              onClick={() => setOpenSection(openSection === cat ? null : cat)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                padding: '5px 0', background: 'none', border: 'none', cursor: 'pointer',
                color: openSection === cat ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)',
                fontSize: '0.62rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase',
              }}
            >
              {cat}
              <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{openSection === cat ? '▲' : '▼'}</span>
            </button>
            {openSection === cat && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', paddingBottom: '6px' }}>
                {colors.map(color => (
                  <div
                    key={color} onClick={() => pickColor(color)} title={color}
                    style={{
                      width: '26px', height: '26px', borderRadius: '7px', cursor: 'pointer',
                      background: color === 'transparent'
                        ? 'repeating-linear-gradient(45deg,#555 0px,#555 4px,#333 4px,#333 8px)'
                        : color,
                      border: value === color ? '2px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.1)',
                      boxShadow: value === color ? '0 0 0 2px rgba(74,144,226,0.3)' : 'none',
                      transition: 'transform 0.1s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.18)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

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
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(0, 0, 0, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Properties</span>
        {activeObj && <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, background: 'rgba(74, 144, 226, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>{activeObj.type}</span>}
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {!activeObj ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', textAlign: 'center', padding: '32px 0', opacity: 0.7 }}>
            Select an object<br />to edit its properties.
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transform</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <Row label="X"><NumberInput value={Math.round(activeObj.left ?? 0)} onChange={v => set('left', num(v))} /></Row>
                <Row label="Y"><NumberInput value={Math.round(activeObj.top ?? 0)} onChange={v => set('top', num(v))} /></Row>
                <Row label="W"><NumberInput value={Math.round((activeObj.width ?? 0) * (activeObj.scaleX ?? 1))} onChange={v => set('width', num(v) / (activeObj.scaleX ?? 1))} /></Row>
                <Row label="H"><NumberInput value={Math.round((activeObj.height ?? 0) * (activeObj.scaleY ?? 1))} onChange={v => set('height', num(v) / (activeObj.scaleY ?? 1))} /></Row>
              </div>
              <Row label="Rotation"><NumberInput value={Math.round(activeObj.angle ?? 0)} onChange={v => set('angle', num(v))} /></Row>
            </div>

            <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.05)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Appearance</label>
              <ColorPicker
                label="Fill"
                value={typeof activeObj.fill === 'string' ? activeObj.fill : '#ffffff'}
                onChange={v => set('fill', v)}
              />
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)' }} />
              <ColorPicker
                label="Stroke"
                value={typeof activeObj.stroke === 'string' ? activeObj.stroke : 'transparent'}
                onChange={v => set('stroke', v)}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                <Row label="Stroke Width"><NumberInput value={activeObj.strokeWidth ?? 0} onChange={v => set('strokeWidth', num(v))} /></Row>
                <Row label="Opacity (%)"><NumberInput value={Math.round((activeObj.opacity ?? 1) * 100)} onChange={v => set('opacity', num(v) / 100)} /></Row>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
