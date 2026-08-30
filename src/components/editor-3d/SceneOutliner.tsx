"use client";

import { useEditor3DStore, SceneObject } from "@/stores/editor3d-store";
import { Eye, EyeOff, Lock, Unlock, Monitor, Lightbulb, Box, Search, ChevronDown, Camera, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

function ObjectRow({ obj }: { obj: SceneObject }) {
  const { selectedId, setSelectedId, updateObject } = useEditor3DStore();
  const isSelected = selectedId === obj.id;

  const iconColor = obj.objectType === 'mesh' ? '#5b8cf5' : obj.objectType === 'light' ? '#f5a623' : '#4ade80';
  const Icon = obj.objectType === 'mesh' ? Box : obj.objectType === 'light' ? Lightbulb : Camera;

  const iconBtnStyle: React.CSSProperties = {
    background: 'transparent', border: 'none',
    color: isSelected ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
    cursor: 'pointer', display: 'flex', padding: '2px', borderRadius: '3px',
    transition: 'color 0.1s',
  };

  return (
    <div
      onClick={() => setSelectedId(obj.id)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 10px 4px 20px', cursor: 'pointer',
        background: isSelected ? 'rgba(71,114,179,0.2)' : 'transparent',
        borderLeft: isSelected ? '2px solid #4772b3' : '2px solid transparent',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', overflow: 'hidden', flex: 1 }}>
        <Icon size={13} color={isSelected ? '#8bb8ff' : iconColor} style={{ flexShrink: 0 }} />
        <span style={{
          fontSize: '0.72rem', fontFamily: 'var(--font-mono)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          color: isSelected ? '#fff' : 'rgba(255,255,255,0.75)',
        }}>
          {obj.name}
        </span>
        {obj.modifiers.filter(m => m.enabled).length > 0 && (
          <span style={{
            fontSize: '0.55rem', padding: '1px 4px', borderRadius: '3px',
            background: 'rgba(107,255,192,0.15)', color: '#6bffc0', flexShrink: 0,
          }}>
            {obj.modifiers.filter(m => m.enabled).length}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
        <button
          onClick={(e) => { e.stopPropagation(); updateObject(obj.id, { renderVisible: !obj.renderVisible }); }}
          style={{ ...iconBtnStyle, color: obj.renderVisible ? (isSelected ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)') : '#f87171' }}
          title="Toggle Render"
        >
          <Monitor size={11} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); updateObject(obj.id, { locked: !obj.locked }); }}
          style={{ ...iconBtnStyle, color: obj.locked ? '#fbbf24' : (isSelected ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)') }}
          title="Toggle Lock"
        >
          {obj.locked ? <Lock size={11} /> : <Unlock size={11} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); updateObject(obj.id, { hidden: !obj.hidden }); }}
          style={{ ...iconBtnStyle, color: obj.hidden ? '#f87171' : (isSelected ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)') }}
          title="Toggle Visibility"
        >
          {!obj.hidden ? <Eye size={11} /> : <EyeOff size={11} />}
        </button>
      </div>
    </div>
  );
}

export function SceneOutliner() {
  const { objects } = useEditor3DStore();
  const [search, setSearch] = useState('');

  const filtered = objects.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: 0, border: 'none', background: 'transparent' }}>
      
      {/* Header */}
      <div className="panel-header" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px 8px',
      }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>
          Outliner
        </span>
        <span style={{
          fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px',
          background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)',
        }}>
          {objects.length}
        </span>
      </div>

      {/* Search */}
      <div style={{ padding: '6px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '5px', padding: '4px 8px',
        }}>
          <Search size={11} color="rgba(255,255,255,0.25)" />
          <input
            type="text"
            placeholder="Filter objects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.75)',
              outline: 'none', fontSize: '0.7rem', width: '100%',
            }}
          />
        </div>
      </div>

      {/* Collection */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 10px 6px', color: 'rgba(255,255,255,0.5)' }}>
          <ChevronDown size={14} />
          <ImageIcon size={14} />
          <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Scene Collection</span>
        </div>
        <div>
          {filtered.map(obj => <ObjectRow key={obj.id} obj={obj} />)}
          {filtered.length === 0 && (
            <div style={{ padding: '16px 12px', fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
              {search ? 'No results' : 'Empty scene'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
