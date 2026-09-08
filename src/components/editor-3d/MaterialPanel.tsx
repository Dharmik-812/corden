"use client";

import { useEditor3DStore } from "@/stores/editor3d-store";


export function MaterialPanel() {
  const { objects, selectedId, updateObject } = useEditor3DStore();
  
  const selectedObj = objects.find(o => o.id === selectedId);

  if (!selectedObj) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(0, 0, 0, 0.2)' }}>
          <span style={{ fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Properties</span>
        </div>
        <div style={{ padding: '32px 0', color: 'var(--text-tertiary)', fontSize: '0.875rem', textAlign: 'center', flex: 1, opacity: 0.7 }}>
          No object selected
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Properties</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, background: 'rgba(74, 144, 226, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>{selectedObj.name}</span>
      </div>
      
      <div style={{ padding: '20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Transform Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transform (World)</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {['X', 'Y', 'Z'].map((axis, i) => (
              <div key={axis} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{axis}</span>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '6px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                  {selectedObj.position[i].toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.05)' }} />

        {/* Material Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Material</label>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Base Color</span>
              <div style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                <input 
                  type="color" 
                  value={selectedObj.color} 
                  onChange={(e) => updateObject(selectedObj.id, { color: e.target.value })}
                  style={{ position: 'absolute', top: '-10px', left: '-10px', width: '50px', height: '50px', cursor: 'pointer', border: 'none', padding: 0 }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Roughness</span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{selectedObj.roughness.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                className="slider" 
                min="0" max="1" step="0.01" 
                value={selectedObj.roughness}
                onChange={(e) => updateObject(selectedObj.id, { roughness: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Metalness</span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{selectedObj.metalness.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                className="slider" 
                min="0" max="1" step="0.01" 
                value={selectedObj.metalness}
                onChange={(e) => updateObject(selectedObj.id, { metalness: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
              />
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
}
