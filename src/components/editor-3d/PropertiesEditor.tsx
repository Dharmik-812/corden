"use client";

import { useEditor3DStore, Modifier } from "@/stores/editor3d-store";
import { Box, Wrench, Image as ImageIcon, Zap, Settings2, Plus, X } from "lucide-react";
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Count</span>
              <input type="number" value={mod.count} onChange={e => updateModifier(objId, mod.id, { count: Math.max(1, parseInt(e.target.value)||1) })} style={{ width: '60px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Offset X</span>
              <input type="number" step={0.1} value={mod.offsetX} onChange={e => updateModifier(objId, mod.id, { offsetX: parseFloat(e.target.value)||0 })} style={{ width: '60px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Offset Y</span>
              <input type="number" step={0.1} value={mod.offsetY} onChange={e => updateModifier(objId, mod.id, { offsetY: parseFloat(e.target.value)||0 })} style={{ width: '60px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Offset Z</span>
              <input type="number" step={0.1} value={mod.offsetZ} onChange={e => updateModifier(objId, mod.id, { offsetZ: parseFloat(e.target.value)||0 })} style={{ width: '60px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }} />
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Levels</span>
            <input type="number" min={1} max={6} value={mod.levels} onChange={e => updateModifier(objId, mod.id, { levels: Math.max(1, Math.min(6, parseInt(e.target.value)||1)) })} style={{ width: '60px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }} />
          </div>
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
    return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>No object selected</div>;
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
      
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1e1e1e', background: '#282828' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            title={tab.title}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1, padding: '8px 0', display: 'flex', justifyContent: 'center',
              background: activeTab === tab.id ? '#383838' : 'transparent',
              border: 'none', borderBottom: activeTab === tab.id ? '2px solid #4772b3' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
              cursor: 'pointer', transition: 'all 0.1s'
            }}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* OBJECT TAB */}
        {activeTab === 'object' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Name</label>
              <input 
                type="text" 
                value={obj.name}
                onChange={e => updateObject(obj.id, { name: e.target.value })}
                style={{ background: '#1e1e1e', border: '1px solid transparent', color: 'var(--text-primary)', padding: '6px 8px', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={!obj.hidden} onChange={e => updateObject(obj.id, { hidden: !e.target.checked })} id="cb_vis" style={{ cursor: 'pointer' }} />
              <label htmlFor="cb_vis" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Visible in Viewport</label>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={obj.renderVisible} onChange={e => updateObject(obj.id, { renderVisible: e.target.checked })} id="cb_rvis" style={{ cursor: 'pointer' }} />
              <label htmlFor="cb_rvis" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Visible in Render</label>
            </div>
          </div>
        )}

        {/* MODIFIERS TAB */}
        {activeTab === 'modifiers' && !isLight && !isCamera && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['array', 'mirror'].map(mod => (
                <button
                  key={mod}
                  onClick={() => addModifier(obj.id, mod as any)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#383838', border: '1px solid #1e1e1e', color: 'var(--text-primary)', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer' }}
                >
                  <Plus size={12} /> Add {mod}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {obj.modifiers.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.75rem', padding: '20px 0' }}>No modifiers</div>
              ) : (
                obj.modifiers.map(mod => (
                  <ModifierItem key={mod.id} objId={obj.id} mod={mod} />
                ))
              )}
            </div>

          </div>
        )}

        {/* MATERIAL / LIGHT / CAMERA TAB */}
        {activeTab === 'material' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isCamera ? (
              // Camera Properties
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Field of View (FOV)</label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{obj.fov || 50}°</span>
                  </div>
                  <input type="range" min="10" max="120" step="1" value={obj.fov || 50} onChange={e => updateObject(obj.id, { fov: parseFloat(e.target.value) })} style={{ width: '100%', cursor: 'pointer' }} />
                </div>
              </>
            ) : isLight ? (
              // Light Properties
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Color</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="color" value={obj.lightColor} onChange={e => updateObject(obj.id, { lightColor: e.target.value })} style={{ width: '40px', height: '30px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }} />
                    <input type="text" value={obj.lightColor} onChange={e => updateObject(obj.id, { lightColor: e.target.value })} style={{ flex: 1, background: '#1e1e1e', border: '1px solid transparent', color: 'var(--text-primary)', padding: '6px 8px', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Intensity</label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{obj.lightIntensity}</span>
                  </div>
                  <input type="range" min="0" max="20" step="0.1" value={obj.lightIntensity} onChange={e => updateObject(obj.id, { lightIntensity: parseFloat(e.target.value) })} style={{ width: '100%', cursor: 'pointer' }} />
                </div>
                {obj.lightType === 'point' || obj.lightType === 'spot' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Distance</label>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{obj.lightDistance}</span>
                    </div>
                    <input type="range" min="0" max="50" step="1" value={obj.lightDistance} onChange={e => updateObject(obj.id, { lightDistance: parseFloat(e.target.value) })} style={{ width: '100%', cursor: 'pointer' }} />
                  </div>
                ) : null}
              </>
            ) : (
              // Material Properties
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Base Color</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="color" value={obj.color} onChange={e => updateObject(obj.id, { color: e.target.value })} style={{ width: '40px', height: '30px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }} />
                    <input type="text" value={obj.color} onChange={e => updateObject(obj.id, { color: e.target.value })} style={{ flex: 1, background: '#1e1e1e', border: '1px solid transparent', color: 'var(--text-primary)', padding: '6px 8px', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Base Color Map (URL)</label>
                  <input type="text" placeholder="https://..." value={obj.map || ''} onChange={e => updateObject(obj.id, { map: e.target.value })} style={{ flex: 1, background: '#1e1e1e', border: '1px solid transparent', color: 'var(--text-primary)', padding: '6px 8px', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Roughness</label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{obj.roughness.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.01" value={obj.roughness} onChange={e => updateObject(obj.id, { roughness: parseFloat(e.target.value) })} style={{ width: '100%', cursor: 'pointer' }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Roughness Map (URL)</label>
                  <input type="text" placeholder="https://..." value={obj.roughnessMap || ''} onChange={e => updateObject(obj.id, { roughnessMap: e.target.value })} style={{ flex: 1, background: '#1e1e1e', border: '1px solid transparent', color: 'var(--text-primary)', padding: '6px 8px', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Metalness</label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{obj.metalness.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.01" value={obj.metalness} onChange={e => updateObject(obj.id, { metalness: parseFloat(e.target.value) })} style={{ width: '100%', cursor: 'pointer' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Normal Map (URL)</label>
                  <input type="text" placeholder="https://..." value={obj.normalMap || ''} onChange={e => updateObject(obj.id, { normalMap: e.target.value })} style={{ flex: 1, background: '#1e1e1e', border: '1px solid transparent', color: 'var(--text-primary)', padding: '6px 8px', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <input type="checkbox" checked={obj.wireframe} onChange={e => updateObject(obj.id, { wireframe: e.target.checked })} id="cb_wire" style={{ cursor: 'pointer' }} />
                  <label htmlFor="cb_wire" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Wireframe overlay</label>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
