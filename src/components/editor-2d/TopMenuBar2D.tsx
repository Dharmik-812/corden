"use client";

import { usePixelEditorStore } from "@/stores/pixelEditor-store";
import { useState, useRef, useEffect } from "react";
import { Save, Download, Grid3X3, Image as ImageIcon, Box, Trash2, Check } from "lucide-react";

export function TopMenuBar2D({ onSave, saveStatus, title }: { onSave?: (title?: string) => void; saveStatus?: string; title?: string }) {
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

  const handleExportPNG = (scale = 8) => {
    const { layers, canvasWidth, canvasHeight } = usePixelEditorStore.getState();
    const off = document.createElement("canvas");
    off.width = canvasWidth * scale;
    off.height = canvasHeight * scale;
    const ctx = off.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    for (const layer of layers) {
      if (!layer.visible) continue;
      ctx.globalAlpha = layer.opacity;
      for (const [key, color] of Object.entries(layer.pixels)) {
        const [px, py] = key.split(",").map(Number);
        ctx.fillStyle = color;
        ctx.fillRect(px * scale, py * scale, scale, scale);
      }
    }
    ctx.globalAlpha = 1;
    const url = off.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `corden-${canvasWidth * scale}x${canvasHeight * scale}.png`;
    a.click();
    setActiveMenu(null);
  };

  const handleOpenIn3D = () => {
    const { layers, canvasHeight } = usePixelEditorStore.getState();
    const voxels: { x: number; y: number; z: number; color: string }[] = [];
    for (const layer of layers) {
      if (!layer.visible) continue;
      for (const [key, color] of Object.entries(layer.pixels)) {
        const [px, py] = key.split(",").map(Number);
        voxels.push({ x: px, y: canvasHeight - py, z: 0, color });
      }
    }
    if (voxels.length === 0) { alert("Canvas is empty. Draw something first!"); return; }
    const k = `corden_voxel_transfer_${Date.now()}`;
    localStorage.setItem(k, JSON.stringify(voxels));
    window.open(`/editor/3d/new?voxel_import=${k}`, "_blank");
    setActiveMenu(null);
  };

  const menuItem = (id: string) => ({
    display: "flex" as const, alignItems: "center" as const, height: "100%",
    padding: "0 11px", cursor: "pointer", borderRadius: "6px",
    fontSize: "0.73rem", fontWeight: 500 as const,
    background: activeMenu === id ? "rgba(74,144,226,0.18)" : "transparent",
    color: activeMenu === id ? "#fff" : "rgba(255,255,255,0.6)",
    transition: "all 0.12s", userSelect: "none" as const,
  });

  const dropdownBase: React.CSSProperties = {
    position: "absolute", top: "calc(100% + 4px)", left: 0, minWidth: "200px",
    background: "rgba(12,13,18,0.98)", backdropFilter: "blur(40px)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset",
    padding: "6px", zIndex: 200, borderRadius: "12px",
  };

  type MenuItemDef = { label: string; onClick?: () => void; shortcut?: string; disabled?: boolean; icon?: React.ReactNode; danger?: boolean };

  function MenuItem({ label, onClick, shortcut, disabled, icon, danger }: MenuItemDef) {
    return (
      <div
        onClick={e => { if (onClick && !disabled) { e.stopPropagation(); onClick(); setActiveMenu(null); } }}
        style={{
          padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center",
          cursor: disabled ? "default" : "pointer",
          color: disabled ? "rgba(255,255,255,0.2)" : danger ? "rgba(255,100,100,0.9)" : "rgba(255,255,255,0.82)",
          fontSize: "0.73rem", transition: "background 0.1s", borderRadius: "8px",
        }}
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = danger ? "rgba(255,80,80,0.12)" : "rgba(74,144,226,0.15)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          {icon && <span style={{ opacity: 0.7 }}>{icon}</span>}
          <span>{label}</span>
        </div>
        {shortcut && <span style={{ color: "rgba(255,255,255,0.25)", marginLeft: "24px", fontSize: "0.63rem", fontFamily: "var(--font-mono)" }}>{shortcut}</span>}
      </div>
    );
  }

  function Divider() {
    return <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />;
  }

  const isSaved = saveStatus === "saved";
  const isSaving = saveStatus === "saving";

  return (
    <div ref={menuBarRef} style={{
      display: "flex", alignItems: "center", height: "38px",
      background: "rgba(10,11,16,0.97)",
      backdropFilter: "blur(24px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      padding: "0 10px", gap: "2px",
      fontFamily: "var(--font-sans)", userSelect: "none",
      flexShrink: 0,
    }}>

      {/* Logo */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: "26px", height: "26px", borderRadius: "6px",
        background: "linear-gradient(135deg, #4772b3, #8bb8ff)",
        marginRight: "6px", flexShrink: 0,
        boxShadow: "0 2px 8px rgba(71,114,179,0.4)",
      }}>
        <ImageIcon size={14} color="#fff" />
      </div>

      {/* File Menu */}
      <div style={{ position: "relative" }}>
        <div style={menuItem("file")}
          onClick={() => setActiveMenu(activeMenu === "file" ? null : "file")}
          onMouseEnter={() => activeMenu && setActiveMenu("file")}
        >File</div>
        {activeMenu === "file" && (
          <div style={dropdownBase}>
            <MenuItem label="Export PNG (8×)" onClick={() => handleExportPNG(8)} icon={<Download size={14} />} />
            <MenuItem label="Export PNG (16×)" onClick={() => handleExportPNG(16)} icon={<Download size={14} />} />
            <MenuItem label="Open in 3D (Voxels)" onClick={handleOpenIn3D} icon={<Box size={14} />} />
            <Divider />
            <MenuItem label="Clear Canvas" onClick={() => { if (confirm("Clear entire canvas?")) clearCanvas(); }} icon={<Trash2 size={14} />} danger />
          </div>
        )}
      </div>

      {/* View Menu */}
      <div style={{ position: "relative" }}>
        <div style={menuItem("view")}
          onClick={() => setActiveMenu(activeMenu === "view" ? null : "view")}
          onMouseEnter={() => activeMenu && setActiveMenu("view")}
        >View</div>
        {activeMenu === "view" && (
          <div style={dropdownBase}>
            <MenuItem label={gridVisible ? "Hide Grid" : "Show Grid"} onClick={toggleGrid} shortcut="G" icon={<Grid3X3 size={14} />} />
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Canvas size badge */}
      <div style={{
        display: "flex", alignItems: "center", gap: "5px",
        padding: "3px 10px", borderRadius: "6px",
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
        color: "rgba(255,255,255,0.35)", fontSize: "0.65rem",
        fontFamily: "var(--font-mono)", letterSpacing: "0.03em",
        marginRight: "8px",
      }}>
        <Grid3X3 size={10} />
        <span>{canvasWidth}×{canvasHeight}</span>
      </div>

      {/* Title + Save */}
      {title !== undefined && (
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "0 10px", borderLeft: "1px solid rgba(255,255,255,0.06)",
        }}>
          <input
            key={title}
            defaultValue={title}
            placeholder="Untitled Project"
            onChange={e => {
              e.currentTarget.style.width = `${Math.max(10, e.target.value.length + 1)}ch`;
            }}
            onFocus={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              e.currentTarget.style.borderColor = "rgba(74,144,226,0.4)";
            }}
            onBlur={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "transparent";
              const newTitle = e.target.value.trim();
              if (newTitle && newTitle !== title) onSave?.(newTitle);
              else e.target.value = title;
            }}
            onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }}
            style={{
              fontSize: "0.75rem", color: "rgba(255,255,255,0.88)", fontWeight: 500,
              background: "transparent", border: "1px solid transparent", outline: "none",
              padding: "3px 7px", borderRadius: "6px",
              width: `${Math.max(10, title.length + 1)}ch`,
              transition: "all 0.2s", fontFamily: "inherit",
            }}
            title="Click to rename"
          />

          <button
            onClick={() => onSave?.()}
            title="Save (Ctrl+S)"
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "5px 12px", borderRadius: "7px", border: "none",
              background: isSaved
                ? "rgba(107,255,192,0.12)"
                : isSaving
                ? "rgba(255,255,255,0.06)"
                : "rgba(74,144,226,0.2)",
              color: isSaved ? "#6bffc0" : isSaving ? "rgba(255,255,255,0.5)" : "#8bb8ff",
              fontSize: "0.68rem", fontWeight: 600, cursor: isSaved ? "default" : "pointer",
              transition: "all 0.2s",
              boxShadow: !isSaved && !isSaving ? "0 0 0 1px rgba(74,144,226,0.2) inset" : "none",
            }}
          >
            {isSaving
              ? <div className="spinner" style={{ width: 10, height: 10, borderWidth: 1 }} />
              : isSaved
              ? <Check size={11} />
              : <Save size={11} />
            }
            <span>{isSaving ? "Saving…" : isSaved ? "Saved" : "Save"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
