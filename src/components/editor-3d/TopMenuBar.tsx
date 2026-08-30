"use client";

import { useEditor3DStore } from "@/stores/editor3d-store";
import { useState, useRef, useEffect } from "react";
import { ChevronRight, Save, Layers, Edit3, Box } from "lucide-react";

const dropdownStyle: React.CSSProperties = {
  position: 'absolute', top: 'calc(100% + 2px)', left: 0, minWidth: '180px',
  background: 'rgba(12,13,18,0.98)', backdropFilter: 'blur(40px)',
  border: '1px solid var(--border-primary)',
  boxShadow: '0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
  padding: '6px', zIndex: 200, borderRadius: '12px',
};

function MenuItem({ label, onClick, shortcut, disabled, closeMenu }: { label: string; onClick?: () => void; shortcut?: string; disabled?: boolean; closeMenu: () => void }) {
  return (
    <div
      onClick={(e) => { if (onClick && !disabled) { e.stopPropagation(); onClick(); closeMenu(); } }}
      style={{
        padding: '6px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        cursor: disabled ? 'default' : 'pointer',
        color: disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.82)',
        fontSize: '0.72rem', transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = 'rgba(71,114,179,0.35)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <span>{label}</span>
      {shortcut && <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: '24px', fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>{shortcut}</span>}
    </div>
  );
}

function Divider3D() { return <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '3px 0' }} />; }

// FIX: Added required closeMenu prop to SubmenuItem
function SubmenuItem({ label, items, id, closeMenu }: { label: string; items: { label: string; onClick: () => void }[]; id: string; closeMenu: () => void }) {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  return (
    <div style={{ position: 'relative' }} onMouseEnter={() => setActiveSubmenu(id)} onMouseLeave={() => setActiveSubmenu(null)}>
      <div style={{
        padding: '6px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        cursor: 'pointer', color: 'rgba(255,255,255,0.82)', fontSize: '0.72rem',
        background: activeSubmenu === id ? 'rgba(71,114,179,0.35)' : 'transparent',
      }}>
        <span>{label}</span>
        <ChevronRight size={11} />
      </div>
      {activeSubmenu === id && (
        <div style={{ ...dropdownStyle, position: 'absolute', left: 'calc(100% - 4px)', top: '-4px', minWidth: '150px' }}>
          {items.map((item, idx) => (
            // FIX: Pass closeMenu to each MenuItem so the root menu closes after selection
            <MenuItem key={idx} label={item.label} onClick={() => { item.onClick(); closeMenu(); }} closeMenu={closeMenu} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TopMenuBar({ onSave, saveStatus, title }: { onSave?: (title?: string) => void; saveStatus?: string; title?: string }) {
  const {
    addObject, addLight, addCamera, undo, redo,
    setShowLeftPanel, showLeftPanel, setShowNPanel, showNPanel,
    setViewPreset, setObjects, commitHistory,
    selectionMode, setSelectionMode, selectedId, objects,
  } = useEditor3DStore();

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

  const menuStyle = (id: string): React.CSSProperties => ({
    padding: '0 10px', height: '100%', display: 'flex', alignItems: 'center',
    cursor: 'pointer', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.01em',
    background: activeMenu === id ? 'rgba(71,114,179,0.3)' : 'transparent',
    color: activeMenu === id ? '#fff' : 'rgba(255,255,255,0.65)',
    borderRadius: '4px', transition: 'all 0.1s',
    userSelect: 'none',
  });

  const canEditMode = selectedId && objects.find(o => o.id === selectedId)?.objectType === 'mesh';

  return (
    <div ref={menuBarRef} className="editor-top-menubar" style={{
      display: 'flex', alignItems: 'center', height: '36px',
      background: 'rgba(10, 12, 18, 0.95)',
      backdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--border-primary)',
      padding: '0 10px', gap: '2px',
      fontFamily: 'var(--font-sans)', userSelect: 'none',
      flexShrink: 0, overflowX: 'auto',
      scrollbarWidth: 'none',
    }}>
      {/* Logo mark */}
      <div style={{
        width: '24px', height: '24px', borderRadius: '6px',
        background: 'linear-gradient(135deg, #4772b3 0%, #7b4fc6 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginRight: '6px',
      }}>
        <Box size={13} color="#fff" />
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
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
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
            fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)',
            marginRight: '8px',
            background: 'transparent', border: '1px solid transparent', outline: 'none',
            padding: '2px 6px', borderRadius: '4px',
            width: `${Math.max(10, title.length + 1)}ch`,
            transition: 'all 0.2s', fontFamily: 'inherit'
          }}
          title="Click to rename"
        />
      )}

      <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.08)', marginRight: '6px', flexShrink: 0 }} />

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
          {activeMenu === id && (
            <div style={dropdownStyle}>
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
                <MenuItem label="Export GLTF" onClick={() => window.dispatchEvent(new Event('export-gltf'))} closeMenu={closeMenu} />
              </>)}
              {id === 'edit' && (<>
                <MenuItem label="Undo" shortcut="Ctrl Z" onClick={undo} closeMenu={closeMenu} />
                <MenuItem label="Redo" shortcut="Ctrl Y" onClick={redo} closeMenu={closeMenu} />
              </>)}
              {id === 'add' && (<>
                {/* FIX: Pass closeMenu to all SubmenuItem calls */}
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
                  { label: 'Front (Num1)', onClick: () => setViewPreset('front') },
                  { label: 'Back (Ctrl+Num1)', onClick: () => setViewPreset('back') },
                  { label: 'Right (Num3)', onClick: () => setViewPreset('right') },
                  { label: 'Left (Ctrl+Num3)', onClick: () => setViewPreset('left') },
                  { label: 'Top (Num7)', onClick: () => setViewPreset('top') },
                  { label: 'Bottom (Ctrl+Num7)', onClick: () => setViewPreset('bottom') },
                  { label: 'Camera (Num0)', onClick: () => setViewPreset('camera') },
                  { label: 'Perspective', onClick: () => setViewPreset('perspective') },
                ]} />
                <Divider3D />
                <MenuItem label="Clear Annotations" onClick={() => useEditor3DStore.getState().setAnnotations([])} closeMenu={closeMenu} />
                <MenuItem label="Clear Measurements" onClick={() => useEditor3DStore.getState().setMeasurements([])} closeMenu={closeMenu} />
              </>)}
            </div>
          )}
        </div>
      ))}

      <div style={{ flex: 1 }} />

      {/* Object / Edit Mode switcher */}
      <div style={{
        display: 'flex', background: 'rgba(0,0,0,0.35)', borderRadius: '6px', padding: '2px',
        border: '1px solid rgba(255,255,255,0.07)', gap: '2px',
      }}>
        {(['object', 'edit'] as const).map((mode) => (
          <button
            key={mode}
            title={mode === 'object' ? 'Object Mode (Tab)' : 'Edit Mode (Tab) — requires mesh selected'}
            disabled={mode === 'edit' && !canEditMode}
            onClick={() => setSelectionMode(selectionMode === mode ? 'object' : mode)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '3px 10px', borderRadius: '4px', border: 'none',
              cursor: mode === 'edit' && !canEditMode ? 'not-allowed' : 'pointer',
              fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.04em',
              textTransform: 'uppercase',
              background: selectionMode === mode
                ? mode === 'edit' ? 'rgba(255,180,0,0.25)' : 'rgba(71,114,179,0.4)'
                : 'transparent',
              color: selectionMode === mode
                ? mode === 'edit' ? '#ffb400' : '#8bb8ff'
                : 'rgba(255,255,255,0.35)',
              transition: 'all 0.15s',
              opacity: mode === 'edit' && !canEditMode ? 0.4 : 1,
            }}
          >
            {mode === 'object' ? <Layers size={11} /> : <Edit3 size={11} />}
            {mode}
          </button>
        ))}
      </div>

      <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.08)', margin: '0 8px', flexShrink: 0 }} />

      {/* Stats — hidden on mobile */}
      <div className="editor-stats-bar" style={{ display: 'flex', gap: '10px', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}>
        <span>{objectCount} mesh{objectCount !== 1 ? 'es' : ''}</span>
        <span>·</span>
        <span>{lightCount} light{lightCount !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.08)', margin: '0 8px', flexShrink: 0 }} />

      {/* Save button */}
      <button
        onClick={() => onSave?.()}
        title="Save (Ctrl+S)"
        style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '3px 10px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.08)',
          background: saveStatus === 'saving' ? 'rgba(71,114,179,0.3)' : 'rgba(255,255,255,0.04)',
          color: saveStatus === 'saved' ? '#4ade80' : saveStatus === 'saving' ? '#8bb8ff' : 'rgba(255,255,255,0.55)',
          cursor: 'pointer', fontSize: '0.68rem', fontWeight: 500,
          transition: 'all 0.2s',
        }}
      >
        <Save size={11} />
        {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : 'Save'}
      </button>
    </div>
  );
}
