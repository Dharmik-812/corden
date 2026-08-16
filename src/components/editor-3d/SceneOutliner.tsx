"use client";

import { useEditor3DStore, SceneObject } from "@/stores/editor3d-store";
import { Eye, EyeOff, Lock, Unlock, Monitor, Image as ImageIcon, Lightbulb, Box, Search, ChevronDown, Camera } from "lucide-react";
import { useState } from "react";

function ObjectRow({ obj }: { obj: SceneObject }) {
  const { selectedId, setSelectedId, updateObject } = useEditor3DStore();
  const isSelected = selectedId === obj.id;

  const Icon = obj.objectType === 'mesh' ? Box : obj.objectType === 'light' ? Lightbulb : Camera;
  const iconColor = obj.objectType === 'mesh' ? '#888888' : obj.objectType === 'light' ? '#ffaa00' : '#4A90E2';

  return (
    <div
      onClick={() => setSelectedId(obj.id)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 8px', cursor: 'pointer',
        background: isSelected ? '#4772b3' : 'transparent',
        color: isSelected ? '#fff' : 'var(--text-primary)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
        <Icon size={14} color={isSelected ? '#fff' : iconColor} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {obj.name}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--text-tertiary)' }}>
        {/* Render toggle */}
        <button 
          onClick={(e) => { e.stopPropagation(); updateObject(obj.id, { renderVisible: !obj.renderVisible }); }}
          style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex' }}
        >
          {obj.renderVisible ? <Monitor size={12} /> : <Monitor size={12} style={{ opacity: 0.2 }} />}
        </button>
        {/* Lock toggle */}
        <button 
          onClick={(e) => { e.stopPropagation(); updateObject(obj.id, { locked: !obj.locked }); }}
          style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex' }}
        >
          {obj.locked ? <Lock size={12} /> : <Unlock size={12} style={{ opacity: 0.2 }} />}
        </button>
        {/* Hide toggle */}
        <button 
          onClick={(e) => { e.stopPropagation(); updateObject(obj.id, { hidden: !obj.hidden }); }}
          style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex' }}
        >
          {!obj.hidden ? <Eye size={12} /> : <EyeOff size={12} color={isSelected ? '#fff' : "var(--error)"} />}
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'transparent' }}>
      
      {/* Header & Search */}
      <div style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '4px 8px' }}>
          <Search size={14} color="var(--text-tertiary)" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.75rem', width: '100%' }}
          />
        </div>
      </div>

      {/* Collection (Hardcoded for now) */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', color: 'var(--text-secondary)' }}>
          <ChevronDown size={14} />
          <ImageIcon size={14} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Scene Collection</span>
        </div>
        <div style={{ paddingLeft: '16px' }}>
          {filtered.map(obj => (
            <ObjectRow key={obj.id} obj={obj} />
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '12px', fontSize: '0.7rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
              No objects found
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
