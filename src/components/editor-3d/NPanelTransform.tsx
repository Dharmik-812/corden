"use client";

import { useEditor3DStore } from "@/stores/editor3d-store";
import { X, Lock, Unlock, Move, RotateCw, Scaling, Maximize } from "lucide-react";
import { useState } from "react";

function NumericInput({ 
  label, value, onChange, step = 0.1, locked = false, onToggleLock 
}: { 
  label: string, value: number, onChange: (v: number) => void, step?: number, locked?: boolean, onToggleLock?: () => void 
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Format to 3 decimal places max
  const displayValue = Number.isInteger(value) ? value.toString() : value.toFixed(3).replace(/\.?0+$/, '');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          display: 'flex', flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '4px', 
          border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' 
        }}
      >
        <div style={{ 
          width: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.05)', color: 'var(--text-tertiary)', fontSize: '0.6rem',
          borderRight: '1px solid rgba(255,255,255,0.05)'
        }}>
          {label}
        </div>
        <input
          type="number"
          value={displayValue}
          step={step}
          disabled={locked}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          style={{ 
            flex: 1, background: 'transparent', border: 'none', color: locked ? 'var(--text-tertiary)' : 'var(--text-primary)',
            padding: '4px 6px', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', minWidth: 0,
            outline: 'none', cursor: locked ? 'not-allowed' : 'text'
          }}
        />
      </div>
      {onToggleLock && (
        <button 
          onClick={onToggleLock}
          style={{ 
            background: 'transparent', border: 'none', color: locked ? 'var(--accent-primary)' : (isHovered ? 'var(--text-tertiary)' : 'transparent'),
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', transition: 'color 0.15s'
          }}
        >
          {locked ? <Lock size={12} /> : <Unlock size={12} />}
        </button>
      )}
    </div>
  );
}

export function NPanelTransform() {
  const { objects, selectedId, updateObject, setShowNPanel } = useEditor3DStore();
  
  const obj = objects.find(o => o.id === selectedId);

  return (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>Item</div>
        <button 
          onClick={() => setShowNPanel(false)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '2px', borderRadius: '4px' }}
        >
          <X size={14} />
        </button>
      </div>

      {!obj ? (
        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', textAlign: 'center', padding: '20px 0' }}>
          No object selected
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Location */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.7rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Move size={12} /> Location
            </div>
            <NumericInput label="X" value={obj.position[0]} onChange={(v) => updateObject(obj.id, { position: [v, obj.position[1], obj.position[2]] })} />
            <NumericInput label="Y" value={obj.position[1]} onChange={(v) => updateObject(obj.id, { position: [obj.position[0], v, obj.position[2]] })} />
            <NumericInput label="Z" value={obj.position[2]} onChange={(v) => updateObject(obj.id, { position: [obj.position[0], obj.position[1], v] })} />
          </div>

          {/* Rotation */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.7rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <RotateCw size={12} /> Rotation
            </div>
            <NumericInput label="X" value={obj.rotation[0]} onChange={(v) => updateObject(obj.id, { rotation: [v, obj.rotation[1], obj.rotation[2]] })} step={0.01} />
            <NumericInput label="Y" value={obj.rotation[1]} onChange={(v) => updateObject(obj.id, { rotation: [obj.rotation[0], v, obj.rotation[2]] })} step={0.01} />
            <NumericInput label="Z" value={obj.rotation[2]} onChange={(v) => updateObject(obj.id, { rotation: [obj.rotation[0], obj.rotation[1], v] })} step={0.01} />
          </div>

          {/* Scale */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.7rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Scaling size={12} /> Scale
            </div>
            <NumericInput label="X" value={obj.scale[0]} onChange={(v) => updateObject(obj.id, { scale: [v, obj.scale[1], obj.scale[2]] })} />
            <NumericInput label="Y" value={obj.scale[1]} onChange={(v) => updateObject(obj.id, { scale: [obj.scale[0], v, obj.scale[2]] })} />
            <NumericInput label="Z" value={obj.scale[2]} onChange={(v) => updateObject(obj.id, { scale: [obj.scale[0], obj.scale[1], v] })} />
          </div>
          
          {/* Dimensions (read-only for now) */}
          {obj.objectType === 'mesh' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.7rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Maximize size={12} /> Dimensions
              </div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem', padding: '0 4px' }}>
                (Base geometry bounds * scale)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
