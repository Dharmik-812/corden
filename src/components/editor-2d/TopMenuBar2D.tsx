"use client";

import { usePixelEditorStore } from "@/stores/pixelEditor-store";
import { useState, useRef, useEffect } from "react";
import { ChevronRight, Save, Download, Grid3X3, Image as ImageIcon } from "lucide-react";

export function TopMenuBar2D({ onSave, saveStatus, title }: { onSave?: () => void; saveStatus?: string; title?: string }) {
  const { 
    canvasWidth, canvasHeight, 
    gridVisible, toggleGrid, clearCanvas,
  } = usePixelEditorStore();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportPNG = () => {
    const { pixels, canvasWidth, canvasHeight } = usePixelEditorStore.getState();
    const offscreen = document.createElement("canvas");
    offscreen.width = canvasWidth;
    offscreen.height = canvasHeight;
    const ctx = offscreen.getContext("2d")!;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    for (const [key, color] of Object.entries(pixels)) {
      const [px, py] = key.split(",").map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(px, py, 1, 1);
    }
    const url = offscreen.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `corden-pixel-${canvasWidth}x${canvasHeight}.png`;
    a.click();
    setActiveMenu(null);
  };

  const menuStyle = (id: string): React.CSSProperties => ({
    padding: '0 10px', height: '100%', display: 'flex', alignItems: 'center',
    cursor: 'pointer', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.01em',
    background: activeMenu === id ? 'rgba(71,114,179,0.3)' : 'transparent',
    color: activeMenu === id ? '#fff' : 'rgba(255,255,255,0.65)',
    borderRadius: '4px', transition: 'all 0.1s',
    userSelect: 'none',
  });

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute', top: 'calc(100% + 2px)', left: 0, minWidth: '180px',
    background: '#1e2026', border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)', padding: '4px 0', zIndex: 200,
    borderRadius: '6px', overflow: 'hidden',
  };

  const MenuItem = ({ label, onClick, shortcut, disabled }: { label: string; onClick?: () => void; shortcut?: string; disabled?: boolean }) => (
    <div
      onClick={(e) => { if (onClick && !disabled) { e.stopPropagation(); onClick(); setActiveMenu(null); } }}
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

  const Divider = () => <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '3px 0' }} />;

  return (
    <div ref={menuBarRef} style={{
      display: 'flex', alignItems: 'center', height: '32px',
      background: '#16181d',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0 8px', gap: '2px',
      fontFamily: 'var(--font-sans)', userSelect: 'none',
      flexShrink: 0,
    }}>
      {/* Brand / Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '24px', height: '24px', borderRadius: '4px',
        background: 'linear-gradient(135deg, #4772b3, #8bb8ff)',
        marginRight: '8px', flexShrink: 0,
      }}>
        <ImageIcon size={14} color="#fff" />
      </div>

      <div style={{ position: 'relative' }}>
        <div style={menuStyle('file')} onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')} onMouseEnter={() => activeMenu && setActiveMenu('file')}>File</div>
        {activeMenu === 'file' && (
          <div style={dropdownStyle}>
            <MenuItem label="Export PNG..." onClick={handleExportPNG} />
            <Divider />
            <MenuItem label="Clear Canvas" onClick={() => { if(confirm('Clear entire canvas?')) clearCanvas(); }} />
          </div>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <div style={menuStyle('view')} onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')} onMouseEnter={() => activeMenu && setActiveMenu('view')}>View</div>
        {activeMenu === 'view' && (
          <div style={dropdownStyle}>
            <MenuItem label={gridVisible ? "Hide Grid" : "Show Grid"} onClick={toggleGrid} shortcut="G" />
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Stats/Info Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>
          <Grid3X3 size={11} /> <span>{canvasWidth}x{canvasHeight} px</span>
        </div>
      </div>

      {/* Project Title & Save */}
      {title && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px',
          borderLeft: '1px solid rgba(255,255,255,0.06)'
        }}>
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{title}</span>
          <button
            onClick={onSave}
            disabled={saveStatus === "saving" || saveStatus === "saved"}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '4px 8px', borderRadius: '4px', border: 'none',
              background: saveStatus === 'saving' ? 'rgba(255,255,255,0.1)' : saveStatus === 'saved' ? 'rgba(107,255,192,0.15)' : 'rgba(71,114,179,0.2)',
              color: saveStatus === 'saving' ? 'rgba(255,255,255,0.5)' : saveStatus === 'saved' ? '#6bffc0' : '#8bb8ff',
              fontSize: '0.65rem', fontWeight: 600, cursor: saveStatus === 'saved' ? 'default' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {saveStatus === "saving" ? <div className="spinner" style={{ width: 10, height: 10, borderWidth: 1 }} /> : <Save size={10} />}
            {saveStatus === "saving" ? "Saving" : saveStatus === "saved" ? "Saved" : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}
