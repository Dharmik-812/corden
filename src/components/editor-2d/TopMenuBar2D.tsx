"use client";

import { usePixelEditorStore } from "@/stores/pixelEditor-store";
import { useState, useRef, useEffect } from "react";
import { Save, Download, Grid3X3, Image as ImageIcon, Box, Trash2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const handleMenuToggle = (id: string) => setActiveMenu(activeMenu === id ? null : id);
  const handleMenuHover = (id: string) => { if (activeMenu) setActiveMenu(id); };

  const menuItemStyle = (id: string): React.CSSProperties => ({
    padding: "0 12px",
    display: "flex", alignItems: "center", height: "100%",
    cursor: "pointer", borderRadius: "6px",
    fontSize: "0.73rem", fontWeight: 600,
    background: activeMenu === id ? "rgba(71, 114, 179, 0.2)" : "transparent",
    color: activeMenu === id ? "#8bb8ff" : "rgba(255,255,255,0.65)",
    transition: "all 0.12s", userSelect: "none",
    letterSpacing: "0.02em",
    margin: "0 1px",
  });

  const dropdownBase: React.CSSProperties = {
    position: "absolute", top: "calc(100% + 4px)", left: 0, minWidth: "210px",
    background: "rgba(6, 8, 14, 0.96)", backdropFilter: "blur(40px)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 16px 48px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
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
          fontSize: "0.73rem", transition: "all 0.12s", borderRadius: "8px", margin: "1px 0",
        }}
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = danger ? "rgba(255,80,80,0.12)" : "rgba(71,114,179,0.18)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          {icon && <span style={{ opacity: 0.65 }}>{icon}</span>}
          <span style={{ fontWeight: 500 }}>{label}</span>
        </div>
        {shortcut && <span style={{ color: "rgba(255,255,255,0.25)", marginLeft: "24px", fontSize: "0.63rem", fontFamily: "var(--font-mono)", background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "4px" }}>{shortcut}</span>}
      </div>
    );
  }

  function Divider() {
    return <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />;
  }

  const isSaved = saveStatus === "saved";
  const isSaving = saveStatus === "saving";

  return (
    <div ref={menuBarRef} className="editor-top-menubar" style={{
      position: "relative", zIndex: 100,
      display: "flex", alignItems: "center", height: "44px",
      background: "rgba(6, 8, 14, 0.9)",
      backdropFilter: "blur(40px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      padding: "0 12px", gap: "2px",
      fontFamily: "var(--font-sans)", userSelect: "none",
      flexShrink: 0,
      boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.4)",
    }}>

      {/* Logo */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: "28px", height: "28px", borderRadius: "8px",
        background: "linear-gradient(135deg, #4772b3 0%, #8bb8ff 100%)",
        marginRight: "10px", flexShrink: 0,
        boxShadow: "0 4px 12px rgba(71,114,179,0.5), inset 0 1px 2px rgba(255,255,255,0.3)",
      }}>
        <ImageIcon size={15} color="#fff" />
      </div>

      {/* File Menu */}
      <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}>
        <div style={menuItemStyle("file")}
          onClick={() => handleMenuToggle("file")}
          onMouseEnter={() => handleMenuHover("file")}
        >File</div>
        <AnimatePresence>
          {activeMenu === "file" && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              style={dropdownBase}
            >
              <MenuItem label="Export PNG (8×)" onClick={() => handleExportPNG(8)} icon={<Download size={14} />} />
              <MenuItem label="Export PNG (16×)" onClick={() => handleExportPNG(16)} icon={<Download size={14} />} />
              <MenuItem label="Open in 3D (Voxels)" onClick={handleOpenIn3D} icon={<Box size={14} />} />
              <Divider />
              <MenuItem label="Clear Canvas" onClick={() => { if (confirm("Clear entire canvas?")) clearCanvas(); }} icon={<Trash2 size={14} />} danger />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View Menu */}
      <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}>
        <div style={menuItemStyle("view")}
          onClick={() => handleMenuToggle("view")}
          onMouseEnter={() => handleMenuHover("view")}
        >View</div>
        <AnimatePresence>
          {activeMenu === "view" && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              style={dropdownBase}
            >
              <MenuItem label={gridVisible ? "Hide Grid" : "Show Grid"} onClick={toggleGrid} shortcut="G" icon={<Grid3X3 size={14} />} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ flex: 1 }} />

      {/* Canvas size badge */}
      <div style={{
        display: "flex", alignItems: "center", gap: "5px",
        padding: "3px 10px", borderRadius: "8px",
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
        color: "rgba(255,255,255,0.35)", fontSize: "0.65rem",
        fontFamily: "var(--font-mono)", letterSpacing: "0.04em",
        marginRight: "12px",
      }}>
        <Grid3X3 size={10} />
        <span>{canvasWidth}×{canvasHeight}</span>
      </div>

      <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.08)", marginRight: "12px" }} />

      {/* Title + Save */}
      {title !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            key={title}
            defaultValue={title}
            placeholder="Untitled Project"
            onChange={e => {
              e.currentTarget.style.width = `${Math.max(10, e.target.value.length + 1)}ch`;
            }}
            onFocus={e => {
              e.currentTarget.style.background = "rgba(0,0,0,0.4)";
              e.currentTarget.style.borderColor = "rgba(71,114,179,0.5)";
              e.currentTarget.style.boxShadow = "0 0 0 2px rgba(71,114,179,0.2)";
              e.currentTarget.style.color = "#fff";
            }}
            onBlur={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              const newTitle = e.target.value.trim();
              if (newTitle && newTitle !== title) onSave?.(newTitle);
              else e.target.value = title;
            }}
            onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }}
            style={{
              fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.6)",
              background: "transparent", border: "1px solid transparent", outline: "none",
              padding: "4px 8px", borderRadius: "6px",
              width: `${Math.max(10, title.length + 1)}ch`,
              transition: "all 0.2s", fontFamily: "inherit",
            }}
            title="Click to rename"
          />

          <button
            onClick={() => onSave?.()}
            title="Save (Ctrl+S)"
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "6px 14px", borderRadius: "8px", border: "none",
              background: isSaved
                ? "rgba(52,211,153,0.12)"
                : isSaving
                ? "rgba(255,255,255,0.06)"
                : "rgba(71,114,179,0.2)",
              color: isSaved ? "#34d399" : isSaving ? "rgba(255,255,255,0.5)" : "#8bb8ff",
              fontSize: "0.72rem", fontWeight: 600, cursor: isSaved ? "default" : "pointer",
              transition: "all 0.2s",
              boxShadow: !isSaved && !isSaving ? "inset 0 0 0 1px rgba(71,114,179,0.3)" : "none",
            }}
            onMouseEnter={e => { if (!isSaved && !isSaving) e.currentTarget.style.background = "rgba(71,114,179,0.3)"; }}
            onMouseLeave={e => { if (!isSaved && !isSaving) e.currentTarget.style.background = "rgba(71,114,179,0.2)"; }}
          >
            {isSaving
              ? <div className="spinner" style={{ width: 10, height: 10, borderWidth: 1 }} />
              : isSaved
              ? <Check size={12} />
              : <Save size={12} />
            }
            <span>{isSaving ? "Saving…" : isSaved ? "Saved" : "Save"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
