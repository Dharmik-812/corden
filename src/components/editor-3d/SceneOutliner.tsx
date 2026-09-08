"use client";

import { useEditor3DStore, SceneObject } from "@/stores/editor3d-store";
import { Eye, EyeOff, Lock, Unlock, Monitor, Lightbulb, Box, Search, ChevronDown, Camera, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

function ObjectRow({ obj }: { obj: SceneObject }) {
  const { selectedId, setSelectedId, updateObject } = useEditor3DStore();
  const isSelected = selectedId === obj.id;

  const iconColor = obj.objectType === 'mesh' ? '#818cf8' : obj.objectType === 'light' ? '#fbbf24' : '#34d399';
  const Icon = obj.objectType === 'mesh' ? Box : obj.objectType === 'light' ? Lightbulb : Camera;

  const iconBtnStyle: React.CSSProperties = {
    background: 'transparent', border: 'none',
    color: isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
    cursor: 'pointer', display: 'flex', padding: '3px', borderRadius: '6px',
    transition: 'all 0.15s ease-in-out',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => setSelectedId(obj.id)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px 8px 16px', margin: '2px 8px', borderRadius: '8px', cursor: 'pointer',
        background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
        boxShadow: isSelected ? 'inset 2px 0 0 #6366f1, inset 0 2px 10px rgba(99, 102, 241, 0.05)' : 'none',
        transition: 'all 0.15s ease-in-out',
      }}
      onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.boxShadow = 'inset 2px 0 0 rgba(255,255,255,0.2)'; } }}
      onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = 'none'; } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
        <Icon size={14} color={isSelected ? '#a5b4fc' : iconColor} style={{ flexShrink: 0 }} />
        <span style={{
          fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: isSelected ? 600 : 400,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          color: isSelected ? '#fff' : 'rgba(255,255,255,0.8)',
          transition: 'color 0.15s',
        }}>
          {obj.name}
        </span>
        {obj.modifiers.filter(m => m.enabled).length > 0 && (
          <span style={{
            fontSize: '0.55rem', padding: '2px 6px', borderRadius: '6px',
            background: 'rgba(16,185,129,0.15)', color: '#34d399', flexShrink: 0, fontWeight: 700
          }}>
            {obj.modifiers.filter(m => m.enabled).length}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
        <button
          onClick={(e) => { e.stopPropagation(); updateObject(obj.id, { renderVisible: !obj.renderVisible }); }}
          style={{ ...iconBtnStyle, color: obj.renderVisible ? (isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)') : '#f87171' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          title="Toggle Render"
        >
          <Monitor size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); updateObject(obj.id, { locked: !obj.locked }); }}
          style={{ ...iconBtnStyle, color: obj.locked ? '#fbbf24' : (isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)') }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          title="Toggle Lock"
        >
          {obj.locked ? <Lock size={12} /> : <Unlock size={12} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); updateObject(obj.id, { hidden: !obj.hidden }); }}
          style={{ ...iconBtnStyle, color: obj.hidden ? '#f87171' : (isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)') }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          title="Toggle Visibility"
        >
          {!obj.hidden ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
      </div>
    </motion.div>
  );
}

export function SceneOutliner() {
  const { objects } = useEditor3DStore();
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);

  const filtered = objects.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: 0, border: 'none', background: 'transparent' }}>
      
      {/* Header */}
      <div style={{
        padding: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.04em', color: '#fff' }}>
          Outliner
        </span>
        <span style={{
          fontSize: '0.65rem', padding: '2px 8px', borderRadius: '8px',
          background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.6)', fontWeight: 600,
        }}>
          {objects.length} items
        </span>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(0,0,0,0.3)', border: focused ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px', padding: '8px 12px',
          transition: 'all 0.2s',
          boxShadow: focused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'inset 0 2px 4px rgba(0,0,0,0.2)',
        }}>
          <Search size={14} color={focused ? "#818cf8" : "rgba(255,255,255,0.4)"} style={{ transition: 'color 0.2s' }} />
          <input
            type="text"
            placeholder="Filter objects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              background: 'transparent', border: 'none', color: '#fff',
              outline: 'none', fontSize: '0.75rem', width: '100%',
            }}
          />
        </div>
      </div>

      {/* Collection */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '16px 16px 8px', color: 'rgba(255,255,255,0.6)' }}>
          <ChevronDown size={14} />
          <ImageIcon size={14} color="#6366f1" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.02em', color: '#fff' }}>Scene Collection</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {filtered.map(obj => <ObjectRow key={obj.id} obj={obj} />)}
          {filtered.length === 0 && (
            <div style={{ padding: '24px 16px', margin: '0 16px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              {search ? 'No objects match filter' : 'Empty scene'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
