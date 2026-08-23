"use client";

import { useState } from "react";
import { usePixelEditorStore, PALETTES } from "@/stores/pixelEditor-store";
import { ChevronDown, Pipette, RotateCcw, Plus } from "lucide-react";
import { CustomPaletteManager } from "./CustomPaletteManager";

const RECENTLY_USED_MAX = 16;

export function ColorPalette() {
  const {
    primaryColor, secondaryColor,
    setPrimaryColor, setSecondaryColor,
    activePalette, setActivePalette,
    customPalettes, removeColorFromPalette, addColorToPalette,
  } = usePixelEditorStore();

  const isCustomPalette = activePalette in customPalettes;

  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);
  const [activeColorTarget, setActiveColorTarget] = useState<"primary" | "secondary">("primary");

  const handlePaletteColorClick = (color: string, btn: "left" | "right") => {
    if (btn === "right") setSecondaryColor(color);
    else setPrimaryColor(color);

    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      return [color, ...filtered].slice(0, RECENTLY_USED_MAX);
    });
  };

  const palette = PALETTES[activePalette] ?? PALETTES["Pico-8"];
  const activeColor = activeColorTarget === "primary" ? primaryColor : secondaryColor;
  const setActiveColor = activeColorTarget === "primary" ? setPrimaryColor : setSecondaryColor;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: "var(--font-sans)" }}>

      {/* ── Active Color Selector ── */}
      <div style={{
        padding: "14px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "linear-gradient(180deg, rgba(20,22,30,0.6) 0%, transparent 100%)",
        flexShrink: 0,
      }}>
        <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "12px" }}>
          Colors
        </div>

        {/* Stacked color swatches */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ position: "relative", width: "64px", height: "52px", flexShrink: 0 }}>
            {/* Secondary (background) swatch */}
            <div
              title="Secondary Color (right-click palette to set)"
              onClick={() => setActiveColorTarget("secondary")}
              style={{
                position: "absolute", bottom: 0, right: 0,
                width: "38px", height: "38px", borderRadius: "9px",
                background: secondaryColor,
                border: `2px solid ${activeColorTarget === "secondary" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.12)"}`,
                cursor: "pointer", transition: "all 0.15s",
                boxShadow: activeColorTarget === "secondary" ? `0 0 0 2px rgba(74,144,226,0.5)` : "0 2px 8px rgba(0,0,0,0.5)",
              }}
            />
            {/* Primary (foreground) swatch */}
            <div
              title="Primary Color"
              onClick={() => setActiveColorTarget("primary")}
              style={{
                position: "absolute", top: 0, left: 0,
                width: "44px", height: "44px", borderRadius: "11px",
                background: primaryColor,
                border: `2px solid ${activeColorTarget === "primary" ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.2)"}`,
                cursor: "pointer", transition: "all 0.15s",
                boxShadow: activeColorTarget === "primary" ? `0 0 0 2px rgba(74,144,226,0.6), 0 4px 14px rgba(0,0,0,0.6)` : "0 4px 14px rgba(0,0,0,0.6)",
                zIndex: 1,
              }}
            />
          </div>

          {/* Active color input */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.35)" }}>
                {activeColorTarget === "primary" ? "↖ Primary" : "↘ Secondary"}
              </span>
              <button
                title="Swap colors"
                onClick={() => {
                  const tmp = primaryColor;
                  setPrimaryColor(secondaryColor);
                  setSecondaryColor(tmp);
                }}
                style={{
                  marginLeft: "auto", background: "transparent", border: "none",
                  color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: "2px",
                  borderRadius: "4px", display: "flex",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "transparent"; }}
              >
                <RotateCcw size={11} />
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {/* Native color picker trigger */}
              <label style={{ position: "relative", width: "30px", height: "30px", borderRadius: "7px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)", flexShrink: 0, cursor: "pointer" }}>
                <div style={{ width: "100%", height: "100%", background: activeColor }} />
                <input
                  type="color"
                  value={activeColor}
                  onChange={e => setActiveColor(e.target.value)}
                  style={{ position: "absolute", opacity: 0, top: 0, left: 0, width: "100%", height: "100%", cursor: "pointer" }}
                />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.15s", background: "rgba(0,0,0,0.4)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0"; }}
                >
                  <Pipette size={10} color="#fff" />
                </div>
              </label>

              {/* Hex input */}
              <input
                type="text"
                value={activeColor}
                onChange={e => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setActiveColor(v);
                }}
                style={{
                  flex: 1, fontFamily: "var(--font-mono)", fontSize: "0.72rem",
                  color: "var(--text-primary)", letterSpacing: "0.04em",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "7px", padding: "5px 8px", outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(74,144,226,0.5)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Palette Selector ── */}
      <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowPaletteMenu(v => !v)}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 12px", borderRadius: "9px",
              border: `1px solid ${showPaletteMenu ? "rgba(74,144,226,0.4)" : "rgba(255,255,255,0.08)"}`,
              background: showPaletteMenu ? "rgba(74,144,226,0.08)" : "rgba(255,255,255,0.03)",
              color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: "0.75rem",
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Palette preview dots */}
              <div style={{ display: "flex", gap: "2px" }}>
                {palette.slice(0, 6).map((c, i) => (
                  <div key={i} style={{ width: "7px", height: "7px", borderRadius: "2px", background: c }} />
                ))}
              </div>
              <span>{activePalette}</span>
            </div>
            <ChevronDown size={13} style={{ transform: showPaletteMenu ? "rotate(180deg)" : "none", transition: "transform 0.2s", opacity: 0.5 }} />
          </button>

          {showPaletteMenu && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 200,
              background: "rgba(10,11,16,0.98)", backdropFilter: "blur(40px)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px",
              padding: "6px", boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
              maxHeight: "240px", overflowY: "auto",
            }}>
              {Object.keys(PALETTES).map(name => (
                <button
                  key={name}
                  onClick={() => { setActivePalette(name); setShowPaletteMenu(false); }}
                  style={{
                    width: "100%", padding: "8px 10px", borderRadius: "8px", border: "none",
                    textAlign: "left", cursor: "pointer", fontSize: "0.73rem",
                    fontFamily: "var(--font-mono)",
                    background: activePalette === name ? "rgba(74,144,226,0.15)" : "transparent",
                    color: activePalette === name ? "var(--accent-primary)" : "var(--text-primary)",
                    transition: "background 0.12s", display: "flex", alignItems: "center", gap: "10px",
                  }}
                  onMouseEnter={e => { if (activePalette !== name) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { if (activePalette !== name) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
                    {PALETTES[name].slice(0, 6).map((c, i) => (
                      <div key={i} style={{ width: "8px", height: "8px", borderRadius: "2px", background: c }} />
                    ))}
                  </div>
                  <span style={{ flex: 1 }}>{name}</span>
                  <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.62rem" }}>{PALETTES[name].length}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Palette Swatches + Custom Manager ── */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {/* Palette grid */}
        <div style={{ padding: "10px 14px" }}>
          <div style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "8px" }}>
            Swatches {isCustomPalette && <span style={{ fontWeight: 400, textTransform: "none", color: "rgba(255,255,255,0.18)" }}>— right-click to remove</span>}
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(22px, 1fr))",
            gap: "4px",
          }}>
            {palette.map((color, idx) => (
              <div
                key={`${color}-${idx}`}
                title={isCustomPalette ? `${color} — L: primary  R: remove` : `${color} — L: primary  R: secondary`}
                onClick={() => handlePaletteColorClick(color, "left")}
                onContextMenu={e => {
                  e.preventDefault();
                  if (isCustomPalette) removeColorFromPalette(activePalette, idx);
                  else handlePaletteColorClick(color, "right");
                }}
                style={{
                  aspectRatio: "1", borderRadius: "5px", cursor: "pointer",
                  background: color,
                  border: primaryColor === color
                    ? "2px solid rgba(255,255,255,0.9)"
                    : secondaryColor === color
                    ? "2px solid rgba(255,255,255,0.4)"
                    : "1px solid rgba(255,255,255,0.07)",
                  outline: primaryColor === color ? "2px solid rgba(74,144,226,0.55)" : "none",
                  outlineOffset: "2px",
                  transition: "transform 0.1s, outline 0.1s",
                  boxSizing: "border-box",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.2)"; e.currentTarget.style.zIndex = "10"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.zIndex = "0"; }}
              />
            ))}

            {/* Add current color to custom palette */}
            {isCustomPalette && (
              <button
                onClick={() => addColorToPalette(activePalette, primaryColor)}
                title={`Add ${primaryColor} to palette`}
                style={{
                  aspectRatio: "1", borderRadius: "5px",
                  border: "1.5px dashed rgba(255,255,255,0.2)", background: "transparent",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,0.3)", padding: 0, transition: "all 0.12s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = primaryColor; e.currentTarget.style.color = primaryColor; e.currentTarget.style.background = `${primaryColor}22`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "transparent"; }}
              >
                <Plus size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Recently used */}
        {recentColors.length > 0 && (
          <div style={{ padding: "0 14px 10px" }}>
            <div style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "8px" }}>
              Recently Used
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(22px, 1fr))",
              gap: "4px",
            }}>
              {recentColors.map((color, i) => (
                <div
                  key={i}
                  title={color}
                  onClick={() => handlePaletteColorClick(color, "left")}
                  onContextMenu={e => { e.preventDefault(); handlePaletteColorClick(color, "right"); }}
                  style={{
                    aspectRatio: "1", borderRadius: "5px", cursor: "pointer",
                    background: color, border: "1px solid rgba(255,255,255,0.07)",
                    transition: "transform 0.1s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "4px 0" }} />

        {/* Custom Palette Manager */}
        <div style={{ padding: "12px 14px 16px" }}>
          <div style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "10px" }}>
            Custom Palettes
          </div>
          <CustomPaletteManager />
        </div>
      </div>
    </div>
  );
}
