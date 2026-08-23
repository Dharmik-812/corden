"use client";

import { useState, useRef } from "react";
import { usePixelEditorStore, DEFAULT_PALETTES } from "@/stores/pixelEditor-store";
import {
  Plus, Trash2, Download, Upload, Pipette, Check,
} from "lucide-react";

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function getLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function CustomPaletteManager() {
  const {
    activePalette, customPalettes, primaryColor,
    createCustomPalette, deleteCustomPalette,
    addColorToPalette, removeColorFromPalette,
    setActivePalette,
  } = usePixelEditorStore();

  const [showNewPaletteDialog, setShowNewPaletteDialog] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const allPalettes = { ...DEFAULT_PALETTES, ...customPalettes };
  const isCustom = activePalette in customPalettes;
  const currentColors = allPalettes[activePalette] ?? [];

  const handleAddColor = () => {
    if (!isCustom) return;
    addColorToPalette(activePalette, primaryColor);
  };

  const handleExportHex = () => {
    const content = currentColors.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${activePalette}.hex`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportHex = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const colors = text.split("\n").map(l => l.trim()).filter(l => /^#[0-9a-fA-F]{6}$/.test(l));
      if (!colors.length) return alert("No valid hex colors found in file.");
      const name = file.name.replace(/\.hex$/i, "") || "Imported";
      createCustomPalette(name, colors);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {/* Palette selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <select
          value={activePalette}
          onChange={e => setActivePalette(e.target.value)}
          style={{
            flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff", outline: "none", borderRadius: "6px", padding: "5px 8px",
            fontSize: "0.72rem", cursor: "pointer",
          }}
        >
          <optgroup label="Built-in">
            {Object.keys(DEFAULT_PALETTES).map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </optgroup>
          {Object.keys(customPalettes).length > 0 && (
            <optgroup label="Custom">
              {Object.keys(customPalettes).map(n => (
                <option key={n} value={n}>★ {n}</option>
              ))}
            </optgroup>
          )}
        </select>

        {/* New palette */}
        <button
          title="New custom palette"
          onClick={() => setShowNewPaletteDialog(true)}
          style={iconBtnStyle}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
        >
          <Plus size={13} />
        </button>

        {/* Import .hex */}
        <button
          title="Import .hex file"
          onClick={() => fileRef.current?.click()}
          style={iconBtnStyle}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
        >
          <Upload size={13} />
        </button>
        <input ref={fileRef} type="file" accept=".hex,.txt" style={{ display: "none" }} onChange={handleImportHex} />

        {/* Export */}
        <button
          title="Export as .hex"
          onClick={handleExportHex}
          style={iconBtnStyle}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
        >
          <Download size={13} />
        </button>

        {/* Delete custom palette */}
        {isCustom && (
          <button
            title="Delete this palette"
            onClick={() => { if (confirm(`Delete palette "${activePalette}"?`)) deleteCustomPalette(activePalette); }}
            style={{ ...iconBtnStyle, color: "#ff6b6b" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,80,80,0.15)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* New palette dialog */}
      {showNewPaletteDialog && (
        <div style={{
          background: "rgba(20,22,30,0.98)", border: "1px solid rgba(71,114,179,0.4)",
          borderRadius: "8px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px",
        }}>
          <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)" }}>New palette name:</span>
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              autoFocus
              value={newPaletteName}
              onChange={e => setNewPaletteName(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && newPaletteName.trim()) {
                  createCustomPalette(newPaletteName.trim(), [primaryColor]);
                  setNewPaletteName("");
                  setShowNewPaletteDialog(false);
                }
                if (e.key === "Escape") setShowNewPaletteDialog(false);
              }}
              placeholder="My Palette"
              style={{
                flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", outline: "none", borderRadius: "5px", padding: "5px 8px", fontSize: "0.72rem",
              }}
            />
            <button
              disabled={!newPaletteName.trim()}
              onClick={() => {
                createCustomPalette(newPaletteName.trim(), [primaryColor]);
                setNewPaletteName("");
                setShowNewPaletteDialog(false);
              }}
              style={{
                padding: "5px 12px", borderRadius: "5px", border: "none",
                background: newPaletteName.trim() ? "rgba(71,114,179,0.5)" : "rgba(255,255,255,0.05)",
                color: newPaletteName.trim() ? "#fff" : "rgba(255,255,255,0.2)",
                cursor: newPaletteName.trim() ? "pointer" : "default", fontSize: "0.7rem",
              }}
            >
              <Check size={12} />
            </button>
          </div>
        </div>
      )}

      {isCustom && (
        <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.25)", margin: 0 }}>
          Right-click a swatch above to remove it from this custom palette · Click to select
        </p>
      )}
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  width: "26px", height: "26px", borderRadius: "6px", border: "none",
  background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)",
  cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
};
