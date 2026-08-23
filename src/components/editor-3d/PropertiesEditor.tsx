"use client";

import { useEditor3DStore, Modifier } from "@/stores/editor3d-store";
import { Box, Wrench, Image as ImageIcon, Zap, Camera, Plus, X } from "lucide-react";
import { useState } from "react";

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
              <input type="number" value={mod.count} onChange={e => updateModifier(objId, mod.id, { count: Math.max(1, parseInt(e.target.value)||1) })} style={{ flex: 1, maxWidth: '80px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-primary)', padding: '4px 6px', borderRadius: '4px', fontSize: '0.72rem', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Offset X</span>
              <input type="number" step={0.1} value={mod.offsetX} onChange={e => updateModifier(objId, mod.id, { offsetX: parseFloat(e.target.value)||0 })} style={{ flex: 1, maxWidth: '80px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-primary)', padding: '4px 6px', borderRadius: '4px', fontSize: '0.72rem', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Offset Y</span>
              <input type="number" step={0.1} value={mod.offsetY} onChange={e => updateModifier(objId, mod.id, { offsetY: parseFloat(e.target.value)||0 })} style={{ flex: 1, maxWidth: '80px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-primary)', padding: '4px 6px', borderRadius: '4px', fontSize: '0.72rem', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Offset Z</span>
              <input type="number" step={0.1} value={mod.offsetZ} onChange={e => updateModifier(objId, mod.id, { offsetZ: parseFloat(e.target.value)||0 })} style={{ flex: 1, maxWidth: '80px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-primary)', padding: '4px 6px', borderRadius: '4px', fontSize: '0.72rem', outline: 'none' }} />
            </div>
          </>
        )}
        
        {mod.type === 'mirror' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {['X', 'Y', 'Z'].map(axis => (
              <label key={axis} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                <input 
                  type="checkbox" 
                  checked={(mod as any)[`mirror${axis}`]} 
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
            <input type="number" min={1} max={6} value={mod.levels} onChange={e => updateModifier(objId, mod.id, { levels: Math.max(1, Math.min(6, parseInt(e.target.value)||1)) })} style={{ flex: 1, maxWidth: '80px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-primary)', padding: '4px 6px', borderRadius: '4px', fontSize: '0.72rem', outline: 'none' }} />
          </div>
        )}

        {mod.type === 'solidify' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Thickness</span>
              <input
                type="number" step={0.01} value={mod.thickness?.toFixed(2) ?? '0.10'}
                onChange={e => updateModifier(objId, mod.id, { thickness: parseFloat(e.target.value) || 0.1 })}
                style={{ flex: 1, maxWidth: '80px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-primary)', padding: '4px 6px', borderRadius: '4px', fontSize: '0.72rem', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Direction</span>
              <span style={{ fontSize: '0.72rem', color: (mod.thickness ?? 0.1) >= 0 ? '#4a90e2' : '#e24a6a', fontWeight: 600 }}>
                {(mod.thickness ?? 0.1) >= 0 ? '▲ Outward (Extrude)' : '▼ Inward (Inset)'}
              </span>
            </div>
            <input
              type="range" min="-1" max="1" step="0.01"
              value={mod.thickness ?? 0.1}
              onChange={e => updateModifier(objId, mod.id, { thickness: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: '#4a90e2' }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export function PropertiesEditor() {
  const { objects, selectedId, updateObject, addModifier } = useEditor3DStore();
  const [activeTab, setActiveTab] = useState<'object' | 'modifiers' | 'material'>('object');
  
  const obj = objects.find(o => o.id === selectedId);

  if (!obj) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', gap: '8px',
        color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem',
      }}>
        <Box size={24} color="rgba(255,255,255,0.1)" />
        <span>No object selected</span>
      </div>
    );
  }

  const isLight = obj.objectType === 'light';
  const isCamera = obj.objectType === 'camera';

  const tabs = [
    { id: 'object', icon: <Box size={16} />, title: 'Object' },
    ...(!isLight && !isCamera ? [{ id: 'modifiers', icon: <Wrench size={16} />, title: 'Modifiers' }] : []),
    { id: 'material', icon: isLight ? <Zap size={16} /> : (isCamera ? <Camera size={16} /> : <ImageIcon size={16} />), title: isLight ? 'Light' : (isCamera ? 'Camera' : 'Material') }
  ] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        padding: '10px 12px 8px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>
          Properties
        </span>
        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}>
          {obj.name}
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.15)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            title={tab.title}
            onClick={() => setActiveTab(tab.id as any)}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Name</label>
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

            {/* Flags */}
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
        )}

        {/* MODIFIERS TAB */}
        {activeTab === 'modifiers' && !isLight && !isCamera && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* Add modifier buttons */}
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
                    onClick={() => addModifier(obj.id, mod.key as any, mod.extra)}
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

            {/* Modifier stack */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* Helper to render a labeled slider row */}
            {isCamera ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Field of View (FOV)</label>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)' }}>{obj.fov || 50}°</span>
                </div>
                <input type="range" min="10" max="120" step="1" value={obj.fov || 50} onChange={e => updateObject(obj.id, { fov: parseFloat(e.target.value) })} style={{ width: '100%', cursor: 'pointer', accentColor: '#4772b3' }} />
              </div>
            ) : isLight ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Color</label>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input type="color" value={obj.lightColor} onChange={e => updateObject(obj.id, { lightColor: e.target.value })} style={{ width: '32px', height: '32px', padding: '1px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }} />
                    <input type="text" value={obj.lightColor} onChange={e => updateObject(obj.id, { lightColor: e.target.value })} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '6px 8px', borderRadius: '5px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', outline: 'none' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Intensity</label>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)' }}>{obj.lightIntensity}</span>
                  </div>
                  <input type="range" min="0" max="20" step="0.1" value={obj.lightIntensity} onChange={e => updateObject(obj.id, { lightIntensity: parseFloat(e.target.value) })} style={{ width: '100%', cursor: 'pointer', accentColor: '#f5a623' }} />
                </div>
                {(obj.lightType === 'point' || obj.lightType === 'spot') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Distance</label>
                      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)' }}>{obj.lightDistance}</span>
                    </div>
                    <input type="range" min="0" max="50" step="1" value={obj.lightDistance} onChange={e => updateObject(obj.id, { lightDistance: parseFloat(e.target.value) })} style={{ width: '100%', cursor: 'pointer', accentColor: '#f5a623' }} />
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Base Color</label>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input type="color" value={obj.color} onChange={e => updateObject(obj.id, { color: e.target.value })} style={{ width: '32px', height: '32px', padding: '1px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }} />
                    <input type="text" value={obj.color} onChange={e => updateObject(obj.id, { color: e.target.value })} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '6px 8px', borderRadius: '5px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', outline: 'none' }} />
                  </div>
                </div>

                {[{ label: 'Roughness', key: 'roughness', value: obj.roughness, color: '#c084fc' }, { label: 'Metalness', key: 'metalness', value: obj.metalness, color: '#6bffc0' }].map(({ label, key, value, color }) => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
                      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)' }}>{value.toFixed(2)}</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.01" value={value} onChange={e => updateObject(obj.id, { [key]: parseFloat(e.target.value) })} style={{ width: '100%', cursor: 'pointer', accentColor: color }} />
                  </div>
                ))}

                {[
                  { label: 'Color Map URL', key: 'map', value: obj.map },
                  { label: 'Normal Map URL', key: 'normalMap', value: obj.normalMap },
                  { label: 'Roughness Map URL', key: 'roughnessMap', value: obj.roughnessMap },
                ].map(({ label, key, value }) => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
                    <input type="text" placeholder="https://…" value={(value as string) || ''} onChange={e => updateObject(obj.id, { [key]: e.target.value })} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '6px 8px', borderRadius: '5px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', outline: 'none' }} />
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
