"use client";

import { useEditor3DStore, Modifier } from "@/stores/editor3d-store";
import { Box, Wrench, Image as ImageIcon, Zap, Camera, Plus, X, Move, RotateCw, Scaling } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function ModifierItem({ objId, mod }: { objId: string, mod: Modifier }) {
  const { updateModifier, removeModifier, toggleModifier } = useEditor3DStore();

  return (
    <div style={{ 
      background: 'rgba(255,255,255,0.02)', 
      border: '1px solid rgba(255,255,255,0.06)', 
      borderRadius: '12px', 
      overflow: 'hidden',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02), 0 4px 12px rgba(0,0,0,0.2)',
      transition: 'border-color 0.2s',
    }}>
      <div style={{ 
        padding: '8px 12px', 
        background: 'rgba(0,0,0,0.2)', 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        borderBottom: '1px solid rgba(255,255,255,0.04)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="checkbox" checked={mod.enabled} onChange={() => toggleModifier(objId, mod.id)} 
            style={{ width: '14px', height: '14px', accentColor: '#6366f1', cursor: 'pointer' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: mod.enabled ? '#fff' : 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>
            {mod.type}
          </span>
        </div>
        <button onClick={() => removeModifier(objId, mod.id)} 
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '2px', borderRadius: '4px', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', opacity: mod.enabled ? 1 : 0.5, pointerEvents: mod.enabled ? 'auto' : 'none' }}>
        {mod.type === 'array' && (
          <>
            <NumericRow label="Cnt" value={(mod as any).count} onChange={v => updateModifier(objId, mod.id, { count: Math.max(1, Math.round(v)) })} step={1} />
            <NumericRow label="X" value={(mod as any).offsetX} onChange={v => updateModifier(objId, mod.id, { offsetX: v })} />
            <NumericRow label="Y" value={(mod as any).offsetY} onChange={v => updateModifier(objId, mod.id, { offsetY: v })} />
            <NumericRow label="Z" value={(mod as any).offsetZ} onChange={v => updateModifier(objId, mod.id, { offsetZ: v })} />
          </>
        )}

        {mod.type === 'mirror' && (
          <div style={{ display: 'flex', gap: '12px' }}>
            {['X', 'Y', 'Z'].map(axis => (
              <label key={axis} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={(mod as unknown as Record<string, boolean>)[`mirror${axis}`]}
                  onChange={e => updateModifier(objId, mod.id, { [`mirror${axis}`]: e.target.checked })}
                  style={{ width: '14px', height: '14px', accentColor: '#c084fc', cursor: 'pointer' }}
                />
                {axis}
              </label>
            ))}
          </div>
        )}

        {mod.type === 'subdivision' && (
          <NumericRow label="Lvl" value={(mod as any).levels} onChange={v => updateModifier(objId, mod.id, { levels: Math.max(1, Math.min(6, Math.round(v))) })} step={1} />
        )}

        {mod.type === 'solidify' && (
          <>
            <NumericRow label="Thk" value={(mod as any).thickness ?? 0.1} onChange={v => updateModifier(objId, mod.id, { thickness: v })} step={0.01} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Direction</span>
              <span style={{ fontSize: '0.72rem', color: ((mod as any).thickness ?? 0.1) >= 0 ? '#38bdf8' : '#f43f5e', fontWeight: 600 }}>
                {((mod as any).thickness ?? 0.1) >= 0 ? '▲ Outward' : '▼ Inward'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SliderRow({ label, value, min, max, step, accentColor = '#6366f1', onChange }: {
  label: string; value: number; min: number; max: number; step: number; accentColor?: string; onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</label>
        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>{value.toFixed(step < 1 ? 2 : 0)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', cursor: 'pointer', accentColor: accentColor }}
      />
    </div>
  );
}

function NumericRow({ label, value, onChange, step = 0.01 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', flexShrink: 0, fontWeight: 700 }}>
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
          flex: 1, background: 'rgba(0,0,0,0.4)',
          border: focused ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.06)',
          color: '#fff', padding: '6px 8px', borderRadius: '8px',
          fontSize: '0.72rem', fontFamily: 'var(--font-mono)', outline: 'none',
          transition: 'all 0.2s',
          boxShadow: focused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'inset 0 2px 4px rgba(0,0,0,0.2)',
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!obj || obj.objectType !== 'mesh') {
      setActiveTab('object');
    }
  }, [selectedId, obj?.objectType]);

  const panelHeaderStyle = {
    padding: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  };

  const sectionLabelStyle = {
    fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)', marginBottom: '4px'
  };

  if (!obj) {
    return (
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', borderRadius: 0, border: 'none', background: 'transparent' }}>
        <div style={panelHeaderStyle}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.04em', color: '#fff' }}>
            Scene Settings
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Quick Add Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={sectionLabelStyle}>Quick Add</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['cube', 'sphere', 'cylinder', 'plane'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => addObject(type)}
                  style={{
                    padding: '6px 12px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
                    color: '#818cf8', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600,
                    transition: 'all 0.15s', textTransform: 'capitalize',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)'; }}
                >
                  {type}
                </button>
              ))}
              <button
                onClick={() => addLight('point')}
                style={{
                  padding: '6px 12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                  color: '#fbbf24', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.2)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)'; }}
              >
                Light
              </button>
              <button
                onClick={() => addCamera()}
                style={{
                  padding: '6px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                  color: '#34d399', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.2)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)'; }}
              >
                Camera
              </button>
            </div>
          </div>

          {/* POST-PROCESSING SECTION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={sectionLabelStyle}>Render Engine</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '4px 0' }}>
              <input type="checkbox" checked={postFX.enabled} onChange={e => setPostFX({ enabled: e.target.checked })} style={{ width: '16px', height: '16px', accentColor: '#6366f1' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>Post-Processing</span>
            </label>

            <AnimatePresence>
              {postFX.enabled && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ paddingLeft: '14px', borderLeft: '2px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px', paddingBottom: '8px' }}>
                    
                    {/* Bloom */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={postFX.bloom.enabled} onChange={e => updatePostFX('bloom', { enabled: e.target.checked })} style={{ width: '14px', height: '14px', accentColor: '#f59e0b' }} />
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)' }}>Bloom</span>
                      </label>
                      {postFX.bloom.enabled && (
                        <div style={{ paddingLeft: '22px' }}>
                          <SliderRow label="Intensity" value={postFX.bloom.intensity} min={0} max={5} step={0.1} accentColor="#f59e0b" onChange={v => updatePostFX('bloom', { intensity: v })} />
                        </div>
                      )}
                    </div>

                    {/* SSAO */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={postFX.ssao.enabled} onChange={e => updatePostFX('ssao', { enabled: e.target.checked })} style={{ width: '14px', height: '14px', accentColor: '#3b82f6' }} />
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)' }}>Ambient Occlusion (SSAO)</span>
                      </label>
                      {postFX.ssao.enabled && (
                        <div style={{ paddingLeft: '22px' }}>
                          <SliderRow label="Intensity" value={postFX.ssao.intensity} min={0} max={5} step={0.1} accentColor="#3b82f6" onChange={v => updatePostFX('ssao', { intensity: v })} />
                        </div>
                      )}
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={postFX.dof.enabled} onChange={e => updatePostFX('dof', { enabled: e.target.checked })} style={{ width: '14px', height: '14px', accentColor: '#10b981' }} />
                      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)' }}>Depth of Field</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={postFX.chromaticAberration.enabled} onChange={e => updatePostFX('chromaticAberration', { enabled: e.target.checked })} style={{ width: '14px', height: '14px', accentColor: '#ec4899' }} />
                      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)' }}>Chromatic Aberration</span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PHYSICS SECTION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={sectionLabelStyle}>Simulation</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '4px 0' }}>
              <input type="checkbox" checked={physicsEnabled} onChange={e => setPhysicsEnabled(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#10b981' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>Physics Engine</span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  const isLight = obj.objectType === 'light';
  const isCamera = obj.objectType === 'camera';
  const isMesh = obj.objectType === 'mesh';

  const tabs = [
    { id: 'object', icon: <Box size={16} />, title: 'Object' },
    ...(!isLight && !isCamera ? [{ id: 'modifiers', icon: <Wrench size={16} />, title: 'Modifiers' }] : []),
    { id: 'material', icon: isLight ? <Zap size={16} /> : (isCamera ? <Camera size={16} /> : <ImageIcon size={16} />), title: isLight ? 'Light' : (isCamera ? 'Camera' : 'Material') }
  ] as const;

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', borderRadius: 0, border: 'none', background: 'transparent' }}>

      {/* Header */}
      <div style={panelHeaderStyle}>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.04em', color: '#fff' }}>
          Properties
        </span>
        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '12px' }}>
          {obj.name}
        </span>
      </div>

      {/* Modern Tabs */}
      <div style={{ display: 'flex', padding: '8px 16px', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              title={tab.title}
              onClick={() => setActiveTab(tab.id as 'object' | 'modifiers' | 'material')}
              style={{
                flex: 1, padding: '8px 0', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '4px',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                borderRadius: '8px',
                color: isActive ? '#818cf8' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.1)' : 'none',
              }}
              onMouseEnter={e => { if(!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              onMouseLeave={e => { if(!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
            >
              {tab.icon}
              <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.04em' }}>{tab.title}</span>
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* OBJECT TAB */}
        {activeTab === 'object' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={sectionLabelStyle}>Name</label>
              <input
                type="text"
                value={obj.name}
                onChange={e => updateObject(obj.id, { name: e.target.value })}
                style={{
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)',
                  color: '#fff', padding: '8px 12px', borderRadius: '8px',
                  fontSize: '0.75rem', outline: 'none', width: '100%',
                  transition: 'all 0.2s',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.2)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'; }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Move size={14} color="rgba(255,255,255,0.5)" />
                  <span style={sectionLabelStyle}>Location</span>
                </div>
                {['X', 'Y', 'Z'].map((axis, i) => (
                  <NumericRow key={axis} label={axis} value={obj.position[i]} onChange={v => { const p = [...obj.position] as [number, number, number]; p[i] = v; updateObject(obj.id, { position: p }); }} />
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <RotateCw size={14} color="rgba(255,255,255,0.5)" />
                  <span style={sectionLabelStyle}>Rotation</span>
                </div>
                {['X', 'Y', 'Z'].map((axis, i) => (
                  <NumericRow key={axis} label={axis} value={obj.rotation[i]} onChange={v => { const r = [...obj.rotation] as [number, number, number]; r[i] = v; updateObject(obj.id, { rotation: r }); }} />
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Scaling size={14} color="rgba(255,255,255,0.5)" />
                  <span style={sectionLabelStyle}>Scale</span>
                </div>
                {['X', 'Y', 'Z'].map((axis, i) => (
                  <NumericRow key={axis} label={axis} value={obj.scale[i]} onChange={v => { const s = [...obj.scale] as [number, number, number]; s[i] = v; updateObject(obj.id, { scale: s }); }} />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'cb_vis', checked: !obj.hidden, onChange: (v: boolean) => updateObject(obj.id, { hidden: !v }), label: 'Visible in Viewport' },
                { id: 'cb_rvis', checked: obj.renderVisible, onChange: (v: boolean) => updateObject(obj.id, { renderVisible: v }), label: 'Visible in Render' },
                ...(!isLight && !isCamera ? [{ id: 'cb_smooth', checked: obj.smoothShading ?? false, onChange: (v: boolean) => updateObject(obj.id, { smoothShading: v }), label: 'Smooth Shading' }] : []),
              ].map(({ id, checked, onChange, label }) => (
                <label key={id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '4px 0' }}>
                  <input type="checkbox" id={id} checked={checked} onChange={e => onChange(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#6366f1', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#fff' }}>{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* MODIFIERS TAB */}
        {activeTab === 'modifiers' && isMesh && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={sectionLabelStyle}>Add Modifier</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {([
                  { key: 'solidify', label: 'Extrude', color: '#f59e0b', extra: { thickness: 0.15 } },
                  { key: 'solidify', label: 'Inset', color: '#ef4444', extra: { thickness: -0.1 } },
                  { key: 'subdivision', label: 'Subdivide', color: '#10b981', extra: { levels: 1 } },
                  { key: 'array', label: 'Array', color: '#3b82f6', extra: {} },
                  { key: 'mirror', label: 'Mirror', color: '#a855f7', extra: {} },
                ] as const).map((mod, idx) => (
                  <button
                    key={idx}
                    onClick={() => addModifier(obj.id, mod.key, mod.extra as Partial<Modifier>)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '6px 12px',
                      background: `${mod.color}15`,
                      border: `1px solid ${mod.color}35`,
                      color: mod.color, borderRadius: '8px',
                      fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${mod.color}25`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${mod.color}15`; }}
                  >
                    <Plus size={12} /> {mod.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {obj.modifiers.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', padding: '32px 0', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                  No modifiers applied
                </div>
              ) : (
                obj.modifiers.map(mod => <ModifierItem key={mod.id} objId={obj.id} mod={mod} />)
              )}
            </div>
          </div>
        )}

        {/* MATERIAL / LIGHT / CAMERA TAB */}
        {activeTab === 'material' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {isCamera ? (
              <SliderRow label="Field of View (FOV)" value={obj.fov || 50} min={10} max={120} step={1} accentColor="#10b981" onChange={v => updateObject(obj.id, { fov: v })} />
            ) : isLight ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={sectionLabelStyle}>Color</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', padding: '2px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)' }}>
                      <input type="color" value={obj.lightColor} onChange={e => updateObject(obj.id, { lightColor: e.target.value })} style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }} />
                    </div>
                    <input type="text" value={obj.lightColor} onChange={e => updateObject(obj.id, { lightColor: e.target.value })} style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', padding: '10px 12px', borderRadius: '8px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', outline: 'none', transition: 'border 0.2s' }} />
                  </div>
                </div>
                <SliderRow label="Intensity" value={obj.lightIntensity ?? 1} min={0} max={20} step={0.1} accentColor="#f59e0b" onChange={v => updateObject(obj.id, { lightIntensity: v })} />
                {(obj.lightType === 'point' || obj.lightType === 'spot') && (
                  <SliderRow label="Distance" value={obj.lightDistance ?? 10} min={0} max={50} step={1} accentColor="#f59e0b" onChange={v => updateObject(obj.id, { lightDistance: v })} />
                )}
              </>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={sectionLabelStyle}>Base Color</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', padding: '2px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)' }}>
                      <input type="color" value={obj.color} onChange={e => updateObject(obj.id, { color: e.target.value })} style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }} />
                    </div>
                    <input type="text" value={obj.color} onChange={e => updateObject(obj.id, { color: e.target.value })} style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', padding: '10px 12px', borderRadius: '8px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', outline: 'none' }} />
                  </div>
                </div>

                <SliderRow label="Roughness" value={obj.roughness} min={0} max={1} step={0.01} accentColor="#c084fc" onChange={v => updateObject(obj.id, { roughness: v })} />
                <SliderRow label="Metalness" value={obj.metalness} min={0} max={1} step={0.01} accentColor="#3b82f6" onChange={v => updateObject(obj.id, { metalness: v })} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={sectionLabelStyle}>Emissive Color</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', padding: '2px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)' }}>
                      <input type="color" value={obj.emissive || '#000000'} onChange={e => updateObject(obj.id, { emissive: e.target.value })} style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }} />
                    </div>
                    <input type="text" value={obj.emissive || '#000000'} onChange={e => updateObject(obj.id, { emissive: e.target.value })} style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', padding: '10px 12px', borderRadius: '8px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', outline: 'none' }} />
                  </div>
                </div>
                <SliderRow label="Emissive Intensity" value={obj.emissiveIntensity ?? 0} min={0} max={5} step={0.1} accentColor="#ef4444" onChange={v => updateObject(obj.id, { emissiveIntensity: v })} />

                <SliderRow label="Opacity" value={obj.opacity ?? 1} min={0} max={1} step={0.01} accentColor="#6366f1" onChange={v => updateObject(obj.id, { opacity: v })} />

                {[
                  { label: 'Color Map URL', key: 'map', value: obj.map },
                  { label: 'Normal Map URL', key: 'normalMap', value: obj.normalMap },
                  { label: 'Roughness Map URL', key: 'roughnessMap', value: obj.roughnessMap },
                ].map(({ label, key, value }) => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={sectionLabelStyle}>{label}</label>
                    <input type="text" placeholder="https://…" value={(value as string) || ''} onChange={e => updateObject(obj.id, { [key]: e.target.value })} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', padding: '10px 12px', borderRadius: '8px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', outline: 'none' }} />
                  </div>
                ))}

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px 0', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <input type="checkbox" checked={obj.wireframe} onChange={e => updateObject(obj.id, { wireframe: e.target.checked })} style={{ width: '16px', height: '16px', accentColor: '#6366f1', cursor: 'pointer' }} />
                  <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 600 }}>Wireframe overlay</span>
                </label>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
