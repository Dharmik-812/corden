"use client";

import { useEditor3DStore, PrimitiveType, LightType } from "@/stores/editor3d-store";
import { useState, useRef, useEffect } from "react";
import { ChevronRight } from "lucide-react";

export function TopMenuBar({ onSave }: { onSave?: () => void }) {
  const { 
    addObject, addLight, addCamera, undo, redo, 
    setShowLeftPanel, showLeftPanel, setShowNPanel, showNPanel,
    setViewPreset, setObjects, commitHistory, history
  } = useEditor3DStore();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleMouseEnter = (menu: string) => {
    if (activeMenu) {
      setActiveMenu(menu);
    }
  };

  const MenuItem = ({ label, onClick, shortcut, hasSubmenu }: { label: string, onClick?: () => void, shortcut?: string, hasSubmenu?: boolean }) => (
    <div
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
          setActiveMenu(null);
        }
      }}
      style={{
        padding: '6px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.75rem',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#4772b3'; e.currentTarget.style.color = '#fff'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-primary)'; }}
    >
      <span>{label}</span>
      {shortcut && <span style={{ color: 'var(--text-tertiary)', marginLeft: '16px' }}>{shortcut}</span>}
      {hasSubmenu && <ChevronRight size={12} style={{ marginLeft: '16px' }} />}
    </div>
  );

  const Divider = () => <div style={{ height: '1px', background: '#383838', margin: '4px 0' }} />;

  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const SubmenuItem = ({ label, items, id }: { label: string, items: any[], id: string }) => (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setActiveSubmenu(id)}
      onMouseLeave={() => setActiveSubmenu(null)}
    >
      <div
        style={{
          padding: '6px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.75rem',
          background: activeSubmenu === id ? '#4772b3' : 'transparent',
        }}
      >
        <span>{label}</span>
        <ChevronRight size={12} style={{ marginLeft: '16px' }} />
      </div>
      {activeSubmenu === id && (
        <div style={{
          position: 'absolute', left: '100%', top: 0, minWidth: '150px',
          background: '#282828', border: '1px solid #1e1e1e', boxShadow: '2px 4px 12px rgba(0,0,0,0.5)',
          padding: '4px 0', zIndex: 110,
        }}>
          {items.map((item, idx) => (
            <MenuItem key={idx} label={item.label} onClick={item.onClick} />
          ))}
        </div>
      )}
    </div>
  );

  const handleExportGLTF = () => {
    // Basic placeholder for GLTF export
    alert("Exporting GLTF functionality will be implemented with GLTFExporter.");
  };

  return (
    <div ref={menuBarRef} style={{
      display: 'flex', alignItems: 'center', height: '28px', background: '#282828',
      borderBottom: '1px solid #1e1e1e', padding: '0 8px', color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)', fontSize: '0.75rem', userSelect: 'none'
    }}>
      {/* Corden Logo / Icon */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px 0 4px', fontWeight: 600 }}>
        <div style={{ width: '16px', height: '16px', background: 'url(/globe.svg)', backgroundSize: 'cover' }} />
      </div>

      {/* Menus */}
      <div style={{ display: 'flex', height: '100%' }}>
        
        {/* FILE */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => handleMenuClick('file')}
            onMouseEnter={() => handleMouseEnter('file')}
            style={{ padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center', cursor: 'pointer', background: activeMenu === 'file' ? '#4772b3' : 'transparent', color: activeMenu === 'file' ? '#fff' : 'inherit' }}
          >
            File
          </div>
          {activeMenu === 'file' && (
            <div style={{ position: 'absolute', top: '100%', left: 0, minWidth: '180px', background: '#282828', border: '1px solid #1e1e1e', boxShadow: '2px 4px 12px rgba(0,0,0,0.5)', padding: '4px 0', zIndex: 100 }}>
              <MenuItem label="New" onClick={() => { if(confirm("Clear scene?")) { setObjects([]); commitHistory(); } }} />
              <MenuItem label="Save" shortcut="Ctrl S" onClick={onSave} />
              <Divider />
              <MenuItem label="Export GLTF" onClick={handleExportGLTF} />
            </div>
          )}
        </div>

        {/* EDIT */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => handleMenuClick('edit')}
            onMouseEnter={() => handleMouseEnter('edit')}
            style={{ padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center', cursor: 'pointer', background: activeMenu === 'edit' ? '#4772b3' : 'transparent', color: activeMenu === 'edit' ? '#fff' : 'inherit' }}
          >
            Edit
          </div>
          {activeMenu === 'edit' && (
            <div style={{ position: 'absolute', top: '100%', left: 0, minWidth: '180px', background: '#282828', border: '1px solid #1e1e1e', boxShadow: '2px 4px 12px rgba(0,0,0,0.5)', padding: '4px 0', zIndex: 100 }}>
              <MenuItem label="Undo" shortcut="Ctrl Z" onClick={undo} />
              <MenuItem label="Redo" shortcut="Ctrl Y" onClick={redo} />
            </div>
          )}
        </div>

        {/* ADD */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => handleMenuClick('add')}
            onMouseEnter={() => handleMouseEnter('add')}
            style={{ padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center', cursor: 'pointer', background: activeMenu === 'add' ? '#4772b3' : 'transparent', color: activeMenu === 'add' ? '#fff' : 'inherit' }}
          >
            Add
          </div>
          {activeMenu === 'add' && (
            <div style={{ position: 'absolute', top: '100%', left: 0, minWidth: '180px', background: '#282828', border: '1px solid #1e1e1e', boxShadow: '2px 4px 12px rgba(0,0,0,0.5)', padding: '4px 0', zIndex: 100 }}>
              <SubmenuItem id="mesh" label="Mesh" items={[
                { label: 'Cube', onClick: () => addObject('cube') },
                { label: 'Sphere', onClick: () => addObject('sphere') },
                { label: 'Cylinder', onClick: () => addObject('cylinder') },
                { label: 'Cone', onClick: () => addObject('cone') },
                { label: 'Plane', onClick: () => addObject('plane') },
                { label: 'Torus', onClick: () => addObject('torus') },
                { label: 'Icosphere', onClick: () => addObject('icosphere') },
              ]} />
              <SubmenuItem id="light" label="Light" items={[
                { label: 'Point', onClick: () => addLight('point') },
                { label: 'Sun', onClick: () => addLight('sun') },
                { label: 'Spot', onClick: () => addLight('spot') },
                { label: 'Area', onClick: () => addLight('area') },
              ]} />
              <MenuItem label="Camera" onClick={() => addCamera()} />
            </div>
          )}
        </div>

        {/* VIEW */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => handleMenuClick('view')}
            onMouseEnter={() => handleMouseEnter('view')}
            style={{ padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center', cursor: 'pointer', background: activeMenu === 'view' ? '#4772b3' : 'transparent', color: activeMenu === 'view' ? '#fff' : 'inherit' }}
          >
            View
          </div>
          {activeMenu === 'view' && (
            <div style={{ position: 'absolute', top: '100%', left: 0, minWidth: '180px', background: '#282828', border: '1px solid #1e1e1e', boxShadow: '2px 4px 12px rgba(0,0,0,0.5)', padding: '4px 0', zIndex: 100 }}>
              <MenuItem label={showLeftPanel ? "Hide Toolbar" : "Show Toolbar"} shortcut="T" onClick={() => setShowLeftPanel(!showLeftPanel)} />
              <MenuItem label={showNPanel ? "Hide Sidebar" : "Show Sidebar"} shortcut="N" onClick={() => setShowNPanel(!showNPanel)} />
              <Divider />
              <SubmenuItem id="cameras" label="Cameras" items={[
                { label: 'Active Camera', onClick: () => setViewPreset('camera') }
              ]} />
              <SubmenuItem id="viewport" label="Viewport" items={[
                { label: 'Front', onClick: () => setViewPreset('front') },
                { label: 'Right', onClick: () => setViewPreset('right') },
                { label: 'Top', onClick: () => setViewPreset('top') },
              ]} />
            </div>
          )}
        </div>

      </div>

      <div style={{ flex: 1 }} />

      {/* Info Stats */}
      <div style={{ padding: '0 12px', color: 'var(--text-tertiary)', display: 'flex', gap: '16px' }}>
        <span>Blender Mode</span>
      </div>
    </div>
  );
}
