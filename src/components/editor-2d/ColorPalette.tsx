"use client";

import { useState } from "react";
import { usePixelEditorStore, PALETTES } from "@/stores/pixelEditor-store";
import { ChevronDown } from "lucide-react";

const RECENTLY_USED_MAX = 16;

export function ColorPalette() {
  const {
    primaryColor, secondaryColor,
    setPrimaryColor, setSecondaryColor,
    activePalette, setActivePalette,
  } = usePixelEditorStore();

  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);
  const [activeColorTarget, setActiveColorTarget] = useState<'primary' | 'secondary'>('primary');

  const handlePaletteColorClick = (color: string, button: 'left' | 'right') => {
    if (button === 'right') {
      setSecondaryColor(color);
    } else {
      setPrimaryColor(color);
    }
    // Add to recently used
    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c !== color);
      return [color, ...filtered].slice(0, RECENTLY_USED_MAX);
    });
  };

  const palette = PALETTES[activePalette] ?? PALETTES['Pico-8'];

  const panelStyle: React.CSSProperties = {
    height: '100%', display: 'flex', flexDirection: 'column', width: '100%',
    fontFamily: 'var(--font-mono)',
  };

  const sectionHeaderStyle: React.CSSProperties = {
    padding: '14px 18px 10px',
    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'var(--text-tertiary)',
  };

  const swatchGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '5px',
    padding: '0 16px',
  };

  return (
    <div style={panelStyle}>

      {/* Active Colors */}
      <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '12px' }}>Active Colors</div>
        
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          {/* Background swatch (behind) */}
          <div
            title="Secondary / Background (right click palette to set)"
            style={{
              width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer',
              background: secondaryColor,
              border: '2px solid rgba(255,255,255,0.1)',
              marginLeft: '14px', marginBottom: '-8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              transition: 'transform 0.15s',
              zIndex: 0,
              position: 'relative',
            }}
            onClick={() => setActiveColorTarget('secondary')}
          />
          {/* Foreground swatch (front) */}
          <div
            title="Primary / Foreground color"
            style={{
              width: '44px', height: '44px', borderRadius: '10px', cursor: 'pointer',
              background: primaryColor,
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              position: 'relative', zIndex: 1, marginLeft: '-22px',
              transition: 'transform 0.15s',
            }}
            onClick={() => setActiveColorTarget('primary')}
          />
          
          {/* Color input */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>
              {activeColorTarget === 'primary' ? 'Foreground' : 'Background'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ position: 'relative', width: '28px', height: '28px', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                <input
                  type="color"
                  value={activeColorTarget === 'primary' ? primaryColor : secondaryColor}
                  onChange={(e) => {
                    if (activeColorTarget === 'primary') setPrimaryColor(e.target.value);
                    else setSecondaryColor(e.target.value);
                  }}
                  style={{ position: 'absolute', top: '-8px', left: '-8px', width: '44px', height: '44px', cursor: 'pointer', border: 'none', padding: 0 }}
                />
              </div>
              <span style={{
                flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                color: 'var(--text-primary)', letterSpacing: '0.05em',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '6px', padding: '4px 8px',
              }}>
                {activeColorTarget === 'primary' ? primaryColor : secondaryColor}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Palette selector */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPaletteMenu((v) => !v)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)',
              background: showPaletteMenu ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
              color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { if (!showPaletteMenu) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={(e) => { if (!showPaletteMenu) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
          >
            <span>{activePalette}</span>
            <ChevronDown size={14} style={{ transform: showPaletteMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {showPaletteMenu && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', zIndex: 100,
              background: 'rgba(10,10,14,0.98)', backdropFilter: 'blur(32px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
              padding: '6px', boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
            }}>
              {Object.keys(PALETTES).map((name) => (
                <button
                  key={name}
                  onClick={() => { setActivePalette(name); setShowPaletteMenu(false); }}
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: '6px', border: 'none',
                    textAlign: 'left', cursor: 'pointer', fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    background: activePalette === name ? 'rgba(74,144,226,0.15)' : 'transparent',
                    color: activePalette === name ? 'var(--accent-primary)' : 'var(--text-primary)',
                    transition: 'background 0.15s', display: 'flex', alignItems: 'center', gap: '10px',
                  }}
                  onMouseEnter={(e) => { if (activePalette !== name) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={(e) => { if (activePalette !== name) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {PALETTES[name].slice(0, 5).map((c, i) => (
                      <div key={i} style={{ width: '8px', height: '8px', borderRadius: '2px', background: c }} />
                    ))}
                  </div>
                  {name} <span style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem' }}>({PALETTES[name].length})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Color swatches */}
      <div style={{ overflow: 'auto', flex: 1 }}>
        <div style={sectionHeaderStyle}>Palette</div>
        <div style={swatchGridStyle}>
          {palette.map((color) => (
            <div
              key={color}
              title={`${color} — Left: set primary, Right: set secondary`}
              onClick={() => handlePaletteColorClick(color, 'left')}
              onContextMenu={(e) => { e.preventDefault(); handlePaletteColorClick(color, 'right'); }}
              style={{
                aspectRatio: '1', borderRadius: '6px', cursor: 'pointer',
                background: color,
                border: primaryColor === color
                  ? '2px solid #fff'
                  : secondaryColor === color
                  ? '2px solid rgba(255,255,255,0.4)'
                  : '1px solid rgba(255,255,255,0.06)',
                boxShadow: primaryColor === color ? '0 0 0 2px rgba(74,144,226,0.5)' : 'none',
                transition: 'transform 0.1s, box-shadow 0.1s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.zIndex = '10'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.zIndex = '0'; }}
            />
          ))}
        </div>

        {/* Recently Used */}
        {recentColors.length > 0 && (
          <>
            <div style={sectionHeaderStyle}>Recent</div>
            <div style={swatchGridStyle}>
              {recentColors.map((color, i) => (
                <div
                  key={`${color}-${i}`}
                  title={color}
                  onClick={() => handlePaletteColorClick(color, 'left')}
                  onContextMenu={(e) => { e.preventDefault(); handlePaletteColorClick(color, 'right'); }}
                  style={{
                    aspectRatio: '1', borderRadius: '6px', cursor: 'pointer',
                    background: color,
                    border: primaryColor === color ? '2px solid #fff' : '1px solid rgba(255,255,255,0.06)',
                    transition: 'transform 0.1s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
