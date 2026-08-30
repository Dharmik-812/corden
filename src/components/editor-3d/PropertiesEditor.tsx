"use client";

import { useEditor3DStore, Modifier } from "@/stores/editor3d-store";
import { Box, Wrench, Image as ImageIcon, Zap, Camera, Plus, X, Move, RotateCw, Scaling } from "lucide-react";
import { useState, useEffect } from "react";

function ModifierItem({ objId, mod }: { objId: string, mod: Modifier }) {
  const { updateModifier, removeModifier, toggleModifier } = useEditor3DStore();

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden' }}>
      <div style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="checkbox" checked={mod.enabled} onChange={() => toggleModifier(objId, mod.id)} style={{ cursor: 'pointer' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: mod.enabled ? 'var(--text-primary)' : 'var(--text-tertiary)', textTransform: 'capitalize' }}>
            {mod.type}
          </span>
        </div>
        <button onClick={() => removeModifier(objId, mod.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
          <X size={14} />
        </button>
      </div>

      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {mod.type === 'array' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Count</span>
              <input type="number" value={(mod as any).count} onChange={e => updateModifier(objId, mod.id, { count: Math.max(1, parseInt(e.target.value)||1) })} style={{ flex: 1, maxWidth: '80px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-primary)', padding: '4px 6px', borderRadius: '4px', fontSize: '0.72rem', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Offset X</span>
              <input type="number" step={0.1} value={(mod as any).offsetX} onChange={e => updateModifier(objId, mod.id, { offsetX: parseFloat(e.target.value)||0 })} style={{ flex: 1, maxWidth: '80px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-primary)', padding: '4px 6px', borderRadius: '4px', fontSize: '0.72rem', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Offset Y</span>
              <input type="number" step={0.1} value={(mod as any).offsetY} onChange={e => updateModifier(objId, mod.id, { offsetY: parseFloat(e.target.value)||0 })} style={{ flex: 1, maxWidth: '80px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-primary)', padding: '4px 6px', borderRadius: '4px', fontSize: '0.72rem', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Offset Z</span>
              <input type="number" step={0.1} value={(mod as any).offsetZ} onChange={e => updateModifier(objId, mod.id, { offsetZ: parseFloat(e.target.value)||0 })} style={{ flex: 1, maxWidth: '80px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-primary)', padding: '4px 6px', borderRadius: '4px', fontSize: '0.72rem', outline: 'none' }} />
            </div>
          </>
        )}

        {mod.type === 'mirror' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {['X', 'Y', 'Z'].map(axis => (
              <label key={axis} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={(mod as unknown as Record<string, boolean>)[`mirror${axis}`]}
                  onChange={e => updateModifier(objId, mod.id, { [`mirror${axis}`]: e.target.checked })}
                />
                {axis}
              </label>
            ))}
          </div>
        )}

        {mod.type === 'subdivision' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Levels</span>
            <input type="number" min={1} max={6} value={(mod as any).levels} onChange={e => updateModifier(objId, mod.id, { levels: Math.max(1, Math.min(6, parseInt(e.target.value)||1)) })} style={{ flex: 1, maxWidth: '80px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-primary)', padding: '4px 6px', borderRadius: '4px', fontSize: '0.72rem', outline: 'none' }} />
          </div>
        )}

        {mod.type === 'solidify' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Thickness</span>
              <input
                type="number" step={0.01} value={(mod as any).thickness?.toFixed(2) ?? '0.10'}
                onChange={e => updateModifier(objId, mod.id, { thickness: parseFloat(e.target.value) || 0.1 })}
                style={{ flex: 1, maxWidth: '80px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-primary)', padding: '4px 6px', borderRadius: '4px', fontSize: '0.72rem', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Direction</span>
              <span style={{ fontSize: '0.72rem', color: ((mod as any).thickness ?? 0.1) >= 0 ? '#4a90e2' : '#e24a6a', fontWeight: 600 }}>
                {((mod as any).thickness ?? 0.1) >= 0 ? '▲ Outward' : '▼ Inward'}
              </span>
            </div>
            <input
              type="range" min="-1" max="1" step="0.01"
              value={(mod as any).thickness ?? 0.1}
              onChange={e => updateModifier(objId, mod.id, { thickness: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: '#4a90e2' }}
            />
          </>
        )}
      </div>
    </div>
  );
}

function SliderRow({ label, value, min, max, step, accentColor, onChange }: {
  label: string; value: number; min: number; max: number; step: number; accentColor?: string; onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}>{value.toFixed(step < 1 ? 2 : 0)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', cursor: 'pointer', accentColor: accentColor || '#4772b3' }}
      />
    </div>
  );
}

function NumericRow({ label, value, onChange, step = 0.01 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
      <div style={{ width: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
        {label}
      </div>
      <input
        type="number"
        value={value.toFixed(3).replace(/\.?0+$/, '')}
        step={step}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, background: 'rgba(0,0,0,0.3)',
          border: focused ? '1px solid rgba(71,114,179,0.6)' : '1px solid rgba(255,255,255,0.06)',
          color: 'var(--text-primary)', padding: '3px 6px', borderRadius: '4px',
          fontSize: '0.68rem', fontFamily: 'var(--font-mono)', outline: 'none',
          transition: 'border-color 0.15s ease',
        }}
      />
    </div>
  );
}

export function PropertiesEditor() {
  const { objects, selectedId, updateObject, addModifier, addObject, addLight, addCamera } = useEditor3DStore();
  const { postFX, setPostFX, updatePostFX, physicsEnabled, setPhysicsEnabled } = useEditor3DStore();
  const [activeTab, setActiveTab] = useState<'object' | 'modifiers' | 'material'>('object');

  const obj = objects.find(o => o.id === selectedId);

  // FIX: Reset activeTab when object type changes — prevents 'modifiers' tab on lights/cameras
  useEffect(() => {
    if (!obj || obj.objectType !== 'mesh') {
      setActiveTab('object');
    }
  }, [selectedId, obj?.objectType]);

  if (!obj) {
    return (
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', borderRadius: 0, border: 'none', background: 'transparent' }}>
        <div className="panel-header" style={{
          padding: '10px 12px 8px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            Scene Properties
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Quick Add Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="panel-section-label">Quick Add</span>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {(['cube', 'sphere', 'cylinder', 'plane'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => addObject(type)}
                  style={{
                    padding: '4px 10px', background: 'rgba(71,114,179,0.15)', border: '1px solid rgba(71,114,179,0.3)',
                    color: '#8bb8ff', borderRadius: '5px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 600,
                    transition: 'all 0.1s', textTransform: 'capitalize',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(71,114,179,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(71,114,179,0.15)'; }}
                >
                  {type}
                </button>
              ))}
              <button
                onClick={() => addLight('point')}
                style={{
                  padding: '4px 10px', background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)',
                  color: '#f5a623', borderRadius: '5px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 600,
                  transition: 'all 0.1s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,166,35,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,166,35,0.12)'; }}
              >
                Light
              </button>
              <button
                onClick={() => addCamera()}
                style={{
                  padding: '4px 10px', background: 'rgba(107,255,192,0.1)', border: '1px solid rgba(107,255,192,0.25)',
                  color: '#6bffc0', borderRadius: '5px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 600,
                  transition: 'all 0.1s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(107,255,192,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(107,255,192,0.1)'; }}
              >
                Camera
              </button>
            </div>
            <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
              Or press Shift+A in the viewport
            </p>
          </div>

          <div className="panel-section-divider" />

          {/* POST-PROCESSING SECTION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="panel-section-label">Render Engine</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '3px 0' }}>
              <input type="checkbox" checked={postFX.enabled} onChange={e => setPostFX({ enabled: e.target.checked })} style={{ width: '14px', height: '14px', accentColor: '#4772b3' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>Post-Processing</span>
            </label>

            {postFX.enabled && (
              <div style={{ paddingLeft: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Bloom */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={postFX.bloom.enabled} onChange={e => updatePostFX('bloom', { enabled: e.target.checked })} />
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)' }}>Bloom</span>
                  </label>
                  {postFX.bloom.enabled && (
                    <div style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <SliderRow label="Intensity" value={postFX.bloom.intensity} min={0} max={5} step={0.1} accentColor="#ffb400" onChange={v => updatePostFX('bloom', { intensity: v })} />
                    </div>
                  )}
                </div>

                {/* SSAO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={postFX.ssao.enabled} onChange={e => updatePostFX('ssao', { enabled: e.target.checked })} />
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)' }}>Ambient Occlusion (SSAO)</span>
                  </label>
                  {postFX.ssao.enabled && (
                    <div style={{ paddingLeft: '20px' }}>
                      <SliderRow label="Intensity" value={postFX.ssao.intensity} min={0} max={5} step={0.1} accentColor="#4a90e2" onChange={v => updatePostFX('ssao', { intensity: v })} />
                    </div>
                  )}
                </div>

                {/* Depth of Field */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={postFX.dof.enabled} onChange={e => updatePostFX('dof', { enabled: e.target.checked })} />
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)' }}>Depth of Field</span>
                </label>

                {/* Chromatic Aberration */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={postFX.chromaticAberration.enabled} onChange={e => updatePostFX('chromaticAberration', { enabled: e.target.checked })} />
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)' }}>Chromatic Aberration</span>
                </label>
              </div>
            )}
          </div>

          <div className="panel-section-divider" />

          {/* PHYSICS SECTION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span className="panel-section-label">Simulation</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '3px 0' }}>
              <input type="checkbox" checked={physicsEnabled} onChange={e => setPhysicsEnabled(e.target.checked)} style={{ width: '14px', height: '14px', accentColor: '#6bffc0' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>Physics Engine</span>
            </label>
            {physicsEnabled && (
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', paddingLeft: '22px' }}>
                Objects fall and collide. Planes stay fixed.
              </span>
            )}
          </div>

        </div>
      </div>
    );
  }

  const isLight = obj.objectType === 'light';
  const isCamera = obj.objectType === 'camera';
  const isMesh = obj.objectType === 'mesh';

  const tabs = [
    { id: 'object', icon: <Box size={15} />, title: 'Object' },
    ...(!isLight && !isCamera ? [{ id: 'modifiers', icon: <Wrench size={15} />, title: 'Modifiers' }] : []),
    { id: 'material', icon: isLight ? <Zap size={15} /> : (isCamera ? <Camera size={15} /> : <ImageIcon size={15} />), title: isLight ? 'Light' : (isCamera ? 'Camera' : 'Material') }
  ] as const;

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', borderRadius: 0, border: 'none', background: 'transparent' }}>

      {/* Header */}
      <div className="panel-header" style={{
        padding: '10px 12px 8px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          Properties
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          {obj.name}
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.15)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            title={tab.title}
            onClick={() => setActiveTab(tab.id as 'object' | 'modifiers' | 'material')}
            style={{
              flex: 1, padding: '7px 0', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '2px',
              background: activeTab === tab.id ? 'rgba(71,114,179,0.15)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #4772b3' : '2px solid transparent',
              color: activeTab === tab.id ? '#8bb8ff' : 'rgba(255,255,255,0.3)',
              cursor: 'pointer', transition: 'all 0.1s',
            }}
          >
            {tab.icon}
            <span style={{ fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.04em' }}>{tab.title}</span>
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>

        {/* OBJECT TAB */}
        {activeTab === 'object' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Name</label>
              <input
                type="text"
                value={obj.name}
                onChange={e => updateObject(obj.id, { name: e.target.value })}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', padding: '6px 8px', borderRadius: '5px',
                  fontSize: '0.75rem', fontFamily: 'var(--font-mono)', outline: 'none',
                  width: '100%',
                }}
              />
            </div>

            {/* Inline Transform (Position / Rotation / Scale) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                  <Move size={11} color="rgba(255,255,255,0.4)" />
                  <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</span>
                </div>
                {['X', 'Y', 'Z'].map((axis, i) => (
                  <NumericRow key={axis} label={axis} value={obj.position[i]}
                    onChange={v => {
                      const p = [...obj.position] as [number, number, number];
                      p[i] = v;
                      updateObject(obj.id, { position: p });
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                  <RotateCw size={11} color="rgba(255,255,255,0.4)" />
                  <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rotation</span>
                </div>
                {['X', 'Y', 'Z'].map((axis, i) => (
                  <NumericRow key={axis} label={axis} value={obj.rotation[i]}
                    onChange={v => {
                      const r = [...obj.rotation] as [number, number, number];
                      r[i] = v;
                      updateObject(obj.id, { rotation: r });
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                  <Scaling size={11} color="rgba(255,255,255,0.4)" />
                  <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scale</span>
                </div>
                {['X', 'Y', 'Z'].map((axis, i) => (
                  <NumericRow key={axis} label={axis} value={obj.scale[i]}
                    onChange={v => {
                      const s = [...obj.scale] as [number, number, number];
                      s[i] = v;
                      updateObject(obj.id, { scale: s });
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Flags */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {[
                { id: 'cb_vis', checked: !obj.hidden, onChange: (v: boolean) => updateObject(obj.id, { hidden: !v }), label: 'Visible in Viewport' },
                { id: 'cb_rvis', checked: obj.renderVisible, onChange: (v: boolean) => updateObject(obj.id, { renderVisible: v }), label: 'Visible in Render' },
                ...(!isLight && !isCamera ? [{ id: 'cb_smooth', checked: obj.smoothShading ?? false, onChange: (v: boolean) => updateObject(obj.id, { smoothShading: v }), label: 'Smooth Shading' }] : []),
              ].map(({ id, checked, onChange, label }) => (
                <label key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '3px 0' }}>
                  <input type="checkbox" id={id} checked={checked} onChange={e => onChange(e.target.checked)}
                    style={{ width: '14px', height: '14px', accentColor: '#4772b3', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)' }}>{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* MODIFIERS TAB */}
        {activeTab === 'modifiers' && isMesh && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Add Modifier</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {([
                  { key: 'solidify', label: 'Extrude', color: '#ffb400', extra: { thickness: 0.15 } },
                  { key: 'solidify', label: 'Inset', color: '#ff6b6b', extra: { thickness: -0.1 } },
                  { key: 'subdivision', label: 'Subdivide', color: '#6bffc0', extra: { levels: 1 } },
                  { key: 'array', label: 'Array', color: '#8bb8ff', extra: {} },
                  { key: 'mirror', label: 'Mirror', color: '#c084fc', extra: {} },
                ] as const).map((mod, idx) => (
                  <button
                    key={idx}
                    onClick={() => addModifier(obj.id, mod.key, mod.extra as Partial<Modifier>)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '4px 8px',
                      background: `${mod.color}15`,
                      border: `1px solid ${mod.color}35`,
                      color: mod.color, borderRadius: '5px',
                      fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.1s',
                    }}
                  >
                    <Plus size={10} /> {mod.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {obj.modifiers.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', padding: '16px 0' }}>No modifiers applied</div>
              ) : (
                obj.modifiers.map(mod => <ModifierItem key={mod.id} objId={obj.id} mod={mod} />)
              )}
            </div>
          </div>
        )}

        {/* MATERIAL / LIGHT / CAMERA TAB */}
        {activeTab === 'material' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {isCamera ? (
              <SliderRow label="Field of View (FOV)" value={obj.fov || 50} min={10} max={120} step={1} accentColor="#4772b3" onChange={v => updateObject(obj.id, { fov: v })} />
            ) : isLight ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Color</label>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input type="color" value={obj.lightColor} onChange={e => updateObject(obj.id, { lightColor: e.target.value })} style={{ width: '32px', height: '32px', padding: '1px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }} />
                    <input type="text" value={obj.lightColor} onChange={e => updateObject(obj.id, { lightColor: e.target.value })} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '6px 8px', borderRadius: '5px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', outline: 'none' }} />
                  </div>
                </div>
                <SliderRow label="Intensity" value={obj.lightIntensity ?? 1} min={0} max={20} step={0.1} accentColor="#f5a623" onChange={v => updateObject(obj.id, { lightIntensity: v })} />
                {(obj.lightType === 'point' || obj.lightType === 'spot') && (
                  <SliderRow label="Distance" value={obj.lightDistance ?? 10} min={0} max={50} step={1} accentColor="#f5a623" onChange={v => updateObject(obj.id, { lightDistance: v })} />
                )}
              </>
            ) : (
              <>
                {/* Base Color */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Base Color</label>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input type="color" value={obj.color} onChange={e => updateObject(obj.id, { color: e.target.value })} style={{ width: '32px', height: '32px', padding: '1px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }} />
                    <input type="text" value={obj.color} onChange={e => updateObject(obj.id, { color: e.target.value })} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '6px 8px', borderRadius: '5px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', outline: 'none' }} />
                  </div>
                </div>

                <SliderRow label="Roughness" value={obj.roughness} min={0} max={1} step={0.01} accentColor="#c084fc" onChange={v => updateObject(obj.id, { roughness: v })} />
                <SliderRow label="Metalness" value={obj.metalness} min={0} max={1} step={0.01} accentColor="#6bffc0" onChange={v => updateObject(obj.id, { metalness: v })} />

                {/* Emissive — previously missing from UI */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Emissive Color</label>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input type="color" value={obj.emissive || '#000000'} onChange={e => updateObject(obj.id, { emissive: e.target.value })} style={{ width: '32px', height: '32px', padding: '1px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }} />
                    <input type="text" value={obj.emissive || '#000000'} onChange={e => updateObject(obj.id, { emissive: e.target.value })} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '6px 8px', borderRadius: '5px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', outline: 'none' }} />
                  </div>
                </div>
                <SliderRow label="Emissive Intensity" value={obj.emissiveIntensity ?? 0} min={0} max={5} step={0.1} accentColor="#ff6b6b" onChange={v => updateObject(obj.id, { emissiveIntensity: v })} />

                {/* Opacity — previously missing from UI */}
                <SliderRow label="Opacity" value={obj.opacity ?? 1} min={0} max={1} step={0.01} accentColor="#8bb8ff" onChange={v => updateObject(obj.id, { opacity: v })} />

                {/* Texture URLs */}
                {[
                  { label: 'Color Map URL', key: 'map', value: obj.map },
                  { label: 'Normal Map URL', key: 'normalMap', value: obj.normalMap },
                  { label: 'Roughness Map URL', key: 'roughnessMap', value: obj.roughnessMap },
                ].map(({ label, key, value }) => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
                    <input type="text" placeholder="https://…" value={(value as string) || ''} onChange={e => updateObject(obj.id, { [key]: e.target.value })} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '6px 8px', borderRadius: '5px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', outline: 'none' }} />
                  </div>
                ))}

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '3px 0' }}>
                  <input type="checkbox" checked={obj.wireframe} onChange={e => updateObject(obj.id, { wireframe: e.target.checked })} style={{ width: '14px', height: '14px', accentColor: '#4772b3', cursor: 'pointer' }} />
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)' }}>Wireframe overlay</span>
                </label>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
