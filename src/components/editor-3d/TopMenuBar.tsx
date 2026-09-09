"use client";

import { useEditor3DStore } from "@/stores/editor3d-store";
import { useState, useRef, useEffect } from "react";
import { ChevronRight, Save, Layers, Edit3, Box } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function MenuItem({ label, onClick, shortcut, disabled, closeMenu }: { label: string; onClick?: () => void; shortcut?: string; disabled?: boolean; closeMenu: () => void }) {
  return (
    <div
      onClick={(e) => { if (onClick && !disabled) { e.stopPropagation(); onClick(); closeMenu(); } }}
      style={{
        padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        cursor: disabled ? 'default' : 'pointer',
        color: disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.85)',
        fontSize: '0.75rem', transition: 'all 0.15s',
        borderRadius: '6px', margin: '2px 4px',
      }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = 'rgba(197, 160, 89, 0.2)'; e.currentTarget.style.color = '#fff'; } }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.85)'; }}
    >
      <span style={{ fontWeight: 500 }}>{label}</span>
      {shortcut && <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '32px', fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>{shortcut}</span>}
    </div>
  );
}

function Divider3D() { return <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />; }

function SubmenuItem({ label, items, id, closeMenu }: { label: string; items: { label: string; onClick: () => void }[]; id: string; closeMenu: () => void }) {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  return (
    <div style={{ position: 'relative' }} onMouseEnter={() => setActiveSubmenu(id)} onMouseLeave={() => setActiveSubmenu(null)}>
      <div style={{
        padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        cursor: 'pointer', color: activeSubmenu === id ? '#fff' : 'rgba(255,255,255,0.85)', fontSize: '0.75rem', fontWeight: 500,
        background: activeSubmenu === id ? 'rgba(197, 160, 89, 0.2)' : 'transparent',
        borderRadius: '6px', margin: '2px 4px', transition: 'all 0.15s'
      }}>
        <span>{label}</span>
        <ChevronRight size={14} color="rgba(255,255,255,0.5)" />
      </div>
      <AnimatePresence>
        {activeSubmenu === id && (
          <motion.div 
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.15 }}
            style={{ 
              position: 'absolute', left: 'calc(100% - 4px)', top: '-4px', minWidth: '160px',
              background: 'rgba(11, 13, 18, 0.95)', backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
              padding: '6px 0', zIndex: 200, borderRadius: '12px'
            }}
          >
            {items.map((item, idx) => (
              <MenuItem key={idx} label={item.label} onClick={() => { item.onClick(); closeMenu(); }} closeMenu={closeMenu} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TopMenuBar({ onSave, saveStatus, title }: { onSave?: (title?: string) => void; saveStatus?: string; title?: string }) {
  const {
    addObject, addLight, addCamera, addModel, undo, redo,
    setShowLeftPanel, showLeftPanel, setShowNPanel, showNPanel,
    setViewPreset, setObjects, commitHistory,
    selectionMode, setSelectionMode, selectedId, objects,
  } = useEditor3DStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);
  const closeMenu = () => setActiveMenu(null);

  const objectCount = objects.filter(o => o.objectType === 'mesh').length;
  const lightCount = objects.filter(o => o.objectType === 'light').length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (menu: string) => setActiveMenu(activeMenu === menu ? null : menu);
  const handleMouseEnter = (menu: string) => { if (activeMenu) setActiveMenu(menu); };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const name = file.name;
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'gltf' || ext === 'glb' || ext === 'obj') {
      addModel(url, ext, name);
    } else {
      alert("Unsupported file type. Please use .gltf, .glb, or .obj");
    }
    // reset input
    e.target.value = '';
  };

  const menuStyle = (id: string): React.CSSProperties => ({
    padding: '6px 14px', display: 'flex', alignItems: 'center',
    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.02em',
    background: activeMenu === id ? 'rgba(197, 160, 89, 0.15)' : 'transparent',
    color: activeMenu === id ? '#C5A059' : 'rgba(255,255,255,0.7)',
    borderRadius: '8px', transition: 'all 0.15s',
    userSelect: 'none', margin: '0 2px',
  });

  const canEditMode = selectedId && objects.find(o => o.id === selectedId)?.objectType === 'mesh';

  return (
    <div ref={menuBarRef} className="editor-top-menubar" style={{
      display: 'flex', alignItems: 'center', height: '48px',
      background: 'rgba(11, 13, 18, 0.8)',
      backdropFilter: 'blur(40px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '0 16px', gap: '4px',
      fontFamily: 'var(--font-sans)', userSelect: 'none',
      flexShrink: 0,
      boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.5)',
      position: 'relative', zIndex: 100,
    }}>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".gltf,.glb,.obj" 
        onChange={handleImport} 
      />

      {/* Logo mark */}
      <div style={{
        width: '28px', height: '28px', borderRadius: '8px',
        background: 'linear-gradient(135deg, #C5A059 0%, #8B1E2D 100%)',
        boxShadow: '0 4px 12px rgba(197, 160, 89, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginRight: '12px',
      }}>
        <Box size={16} color="#fff" />
      </div>

      {/* Project title */}
      {title !== undefined && (
        <input
          key={title}
          defaultValue={title}
          placeholder="Untitled Scene"
          onChange={(e) => {
            e.currentTarget.style.width = `${Math.max(10, e.target.value.length + 1)}ch`;
          }}
          onFocus={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.4)';
            e.currentTarget.style.borderColor = '#C5A059';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(197, 160, 89, 0.2)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
            e.currentTarget.style.boxShadow = 'none';
            const newTitle = e.target.value.trim();
            if (newTitle && newTitle !== title) {
              onSave?.(newTitle);
            } else {
              e.target.value = title;
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          style={{
            fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
            marginRight: '12px',
            background: 'transparent', border: '1px solid transparent', outline: 'none',
            padding: '4px 8px', borderRadius: '6px',
            width: `${Math.max(10, title.length + 1)}ch`,
            transition: 'all 0.2s', fontFamily: 'inherit'
          }}
          title="Click to rename"
        />
      )}

      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', marginRight: '8px', flexShrink: 0 }} />

      {/* Menu items */}
      {[
        { id: 'file', label: 'File' },
        { id: 'edit', label: 'Edit' },
        { id: 'add', label: 'Add' },
        { id: 'view', label: 'View' },
      ].map(({ id, label }) => (
        <div key={id} style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
          <div
            onClick={() => handleMenuClick(id)}
            onMouseEnter={() => handleMouseEnter(id)}
            style={menuStyle(id)}
          >
            {label}
          </div>
          <AnimatePresence>
            {activeMenu === id && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0, minWidth: '220px',
                  background: 'rgba(11, 13, 18, 0.95)', backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
                  padding: '6px 0', zIndex: 200, borderRadius: '12px',
                }}
              >
                {id === 'file' && (<>
                  <MenuItem label="New Scene" closeMenu={closeMenu} onClick={() => {
                    if (confirm('Clear scene?')) {
                      setObjects([]);
                      useEditor3DStore.getState().setAnnotations([]);
                      useEditor3DStore.getState().setMeasurements([]);
                      useEditor3DStore.getState().setCursor3D([0, 0, 0]);
                      commitHistory();
                    }
                  }} />
                  <MenuItem label="Save" shortcut="Ctrl S" onClick={onSave} closeMenu={closeMenu} />
                  <Divider3D />
                  <MenuItem label="Import Model (GLTF/OBJ)" onClick={() => fileInputRef.current?.click()} closeMenu={closeMenu} />
                  <Divider3D />
                  <MenuItem label="Export GLTF" onClick={() => window.dispatchEvent(new Event('export-gltf'))} closeMenu={closeMenu} />
                  <MenuItem label="Export OBJ" onClick={() => window.dispatchEvent(new Event('export-obj'))} closeMenu={closeMenu} />
                  <MenuItem label="Render Image" onClick={() => window.dispatchEvent(new Event('render-image'))} closeMenu={closeMenu} />
                </>)}
                {id === 'edit' && (<>
                  <MenuItem label="Undo" shortcut="Ctrl Z" onClick={undo} closeMenu={closeMenu} />
                  <MenuItem label="Redo" shortcut="Ctrl Y" onClick={redo} closeMenu={closeMenu} />
                </>)}
                {id === 'add' && (<>
                  <SubmenuItem id="mesh" label="Mesh" closeMenu={closeMenu} items={[
                    { label: 'Cube', onClick: () => addObject('cube') },
                    { label: 'Sphere', onClick: () => addObject('sphere') },
                    { label: 'Cylinder', onClick: () => addObject('cylinder') },
                    { label: 'Cone', onClick: () => addObject('cone') },
                    { label: 'Plane', onClick: () => addObject('plane') },
                    { label: 'Torus', onClick: () => addObject('torus') },
                    { label: 'Icosphere', onClick: () => addObject('icosphere') },
                  ]} />
                  <SubmenuItem id="light" label="Light" closeMenu={closeMenu} items={[
                    { label: 'Point', onClick: () => addLight('point') },
                    { label: 'Sun', onClick: () => addLight('sun') },
                    { label: 'Spot', onClick: () => addLight('spot') },
                    { label: 'Area', onClick: () => addLight('area') },
                  ]} />
                  <MenuItem label="Camera" onClick={() => addCamera()} closeMenu={closeMenu} />
                </>)}
                {id === 'view' && (<>
                  <MenuItem label={showLeftPanel ? "Hide Toolbar" : "Show Toolbar"} shortcut="T" onClick={() => setShowLeftPanel(!showLeftPanel)} closeMenu={closeMenu} />
                  <MenuItem label={showNPanel ? "Hide N-Panel" : "Show N-Panel"} shortcut="N" onClick={() => setShowNPanel(!showNPanel)} closeMenu={closeMenu} />
                  <Divider3D />
                  <SubmenuItem id="viewport" label="Viewport" closeMenu={closeMenu} items={[
                    { label: 'Front', onClick: () => setViewPreset('front') },
                    { label: 'Back', onClick: () => setViewPreset('back') },
                    { label: 'Right', onClick: () => setViewPreset('right') },
                    { label: 'Left', onClick: () => setViewPreset('left') },
                    { label: 'Top', onClick: () => setViewPreset('top') },
                    { label: 'Bottom', onClick: () => setViewPreset('bottom') },
                    { label: 'Camera', onClick: () => setViewPreset('camera') },
                    { label: 'Perspective', onClick: () => setViewPreset('perspective') },
                  ]} />
                  <Divider3D />
                  <MenuItem label="Clear Annotations" onClick={() => useEditor3DStore.getState().setAnnotations([])} closeMenu={closeMenu} />
                  <MenuItem label="Clear Measurements" onClick={() => useEditor3DStore.getState().setMeasurements([])} closeMenu={closeMenu} />
                </>)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      <div style={{ flex: 1 }} />

      {/* Object / Edit Mode switcher */}
      <div style={{
        display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: '10px', padding: '4px',
        border: '1px solid rgba(255,255,255,0.08)', gap: '4px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
      }}>
        {(['object', 'edit'] as const).map((mode) => (
          <button
            key={mode}
            title={mode === 'object' ? 'Object Mode (Tab)' : 'Edit Mode (Tab) — requires mesh selected'}
            disabled={mode === 'edit' && !canEditMode}
            onClick={() => setSelectionMode(selectionMode === mode ? 'object' : mode)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '6px', border: 'none',
              cursor: mode === 'edit' && !canEditMode ? 'not-allowed' : 'pointer',
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em',
              textTransform: 'uppercase',
              background: selectionMode === mode
                ? mode === 'edit' ? 'rgba(245,158,11,0.2)' : 'rgba(197, 160, 89, 0.2)'
                : 'transparent',
              color: selectionMode === mode
                ? mode === 'edit' ? '#fcd34d' : '#C5A059'
                : 'rgba(255,255,255,0.4)',
              transition: 'all 0.2s',
              opacity: mode === 'edit' && !canEditMode ? 0.4 : 1,
              boxShadow: selectionMode === mode ? (mode === 'edit' ? 'inset 0 0 0 1px rgba(245,158,11,0.4), 0 2px 8px rgba(245,158,11,0.2)' : 'inset 0 0 0 1px rgba(197, 160, 89, 0.4), 0 2px 8px rgba(197, 160, 89, 0.2)') : 'none',
            }}
          >
            {mode === 'object' ? <Layers size={14} /> : <Edit3 size={14} />}
            {mode}
          </button>
        ))}
      </div>

      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 12px', flexShrink: 0 }} />

      {/* Stats — hidden on mobile */}
      <div className="editor-stats-bar" style={{ display: 'flex', gap: '12px', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)' }}>
        <span>{objectCount} mesh{objectCount !== 1 ? 'es' : ''}</span>
        <span>·</span>
        <span>{lightCount} light{lightCount !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 12px', flexShrink: 0 }} />

      {/* Save button */}
      <button
        onClick={() => onSave?.()}
        title="Save (Ctrl+S)"
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
          background: saveStatus === 'saving' ? 'rgba(197, 160, 89, 0.2)' : 'rgba(255,255,255,0.05)',
          color: saveStatus === 'saved' ? '#34d399' : saveStatus === 'saving' ? '#C5A059' : '#fff',
          cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
          transition: 'all 0.2s',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = saveStatus === 'saving' ? 'rgba(197, 160, 89, 0.3)' : 'rgba(255,255,255,0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = saveStatus === 'saving' ? 'rgba(197, 160, 89, 0.2)' : 'rgba(255,255,255,0.05)'; }}
      >
        <Save size={14} />
        {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : 'Save'}
      </button>
    </div>
  );
}
